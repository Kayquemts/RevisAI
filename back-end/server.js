const express = require('express');
const cors = require('cors');
const { db, admin } = require('./firebaseAdmin');
require('dotenv').config();
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


function parseFlashcardsMarkdown(markdown) {
  const cards = [];
  const blocks = markdown.split('---').filter(block => block.trim());

  for (const block of blocks) {
    const perguntaMatch = block.match(/\*\*Pergunta:\*\*\s*(.+)/);
    const respostaMatch = block.match(/\*\*Resposta:\*\*\s*([\s\S]+?)(?=\n\n|$)/);

    if (perguntaMatch && respostaMatch) {
      let cleanAnswer = respostaMatch[1].trim();
      cleanAnswer = cleanAnswer.replace(/\*\*[^*]+\*\*/g, '')
        .replace(/\\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      cards.push({
        id: Math.random().toString(36).substr(2, 9),
        question: perguntaMatch[1].trim().replace(/\\n/g, ' ').replace(/\n/g, ' ').trim(),
        answer: cleanAnswer,
      });
    }
  }

  return cards;
}

app.post('/api/generate-flashcards', async (req, res) => {
  const { content, file_base64, file_type, file_name, mode, history } = req.body;

  if (!content && !file_base64) {
    return res.status(400).json({ error: 'Envie "content" ou "file_base64".' });
  }

  const client = new LambdaClient({
    region: "us-east-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const payload = JSON.stringify({
    httpMethod: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, file_base64, file_type, file_name, mode, history }),
    isBase64Encoded: false,
  });

  const command = new InvokeCommand({
    FunctionName: "flashcard-api",
    Payload: Buffer.from(payload),
    InvocationType: "RequestResponse",
  });

  try {
    const response = await client.send(command);
    const result = JSON.parse(Buffer.from(response.Payload).toString());

    console.log("Resposta do Lambda:", result);

    let parsedBody;
    try {
      parsedBody = JSON.parse(result.body);
    } catch {
      parsedBody = { artifact: result.body, artifact_type: 'unknown', mode: 'auto' };
    }

    if (result.statusCode && result.statusCode !== 200) {
      return res.status(result.statusCode).json(parsedBody);
    }

    if (parsedBody.artifact_type === 'flashcards') {
      const cards = parseFlashcardsMarkdown(parsedBody.artifact);
      res.status(result.statusCode || 200).json({
        artifact: cards,
        artifact_type: parsedBody.artifact_type,
        mode: parsedBody.mode,
        router_decision: parsedBody.router_decision
      });
    } else {
      res.status(result.statusCode || 200).json({
        artifact: parsedBody.artifact,
        artifact_type: parsedBody.artifact_type,
        mode: parsedBody.mode,
        router_decision: parsedBody.router_decision
      });
    }
  } catch (error) {
    console.error("Erro ao invocar Lambda:", error);
    res.status(500).json({
      error: "Falha na comunicação com o serviço de geração.",
      details: error.message,
    });
  }
});

app.get('/api/flashcards', async (req, res) => {
  try {
    const snapshot = await db.collection('flashcards').orderBy('createdAt', 'asc').get();
    const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(cards);
  } catch (error) {
    console.error('Erro ao buscar flashcards:', error);
    res.status(500).json({ error: 'Falha ao buscar flashcards.', details: error.message });
  }
});

app.post('/api/flashcards', async (req, res) => {
  const { question, answer, themeName } = req.body;

  if (!question || !answer) {
    return res.status(400).json({
      error: 'Os campos "question" e "answer" são obrigatórios.'
    });
  }

  try {
    const newFlashcard = {
      question,
      answer,
      themeName: themeName || 'Geral',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('flashcards').add(newFlashcard);

    return res.status(201).json({
      message: 'Flashcard salvo com sucesso.',
      id: docRef.id,
      flashcard: newFlashcard
    });
  } catch (error) {
    console.error('Erro ao salvar flashcard:', error);
    return res.status(500).json({
      error: 'Falha ao salvar o flashcard no banco de dados.',
      details: error.message
    });
  }
});

app.put('/api/flashcards/:id', async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  if (!question && !answer) {
    return res.status(400).json({
      error: 'Nenhum dado fornecido. Envie "question" ou "answer" para atualizar.'
    });
  }

  try {
    const flashcardRef = db.collection('flashcards').doc(id);
    const doc = await flashcardRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Flashcard não encontrado.' });
    }

    const updateData = {};
    if (question) updateData.question = question;
    if (answer) updateData.answer = answer;
    updateData.updatedAt = new Date().toISOString();

    await flashcardRef.update(updateData);

    res.status(200).json({
      message: 'Flashcard atualizado com sucesso.',
      id,
      ...updateData
    });
  } catch (error) {
    console.error("Erro ao atualizar flashcard:", error);
    res.status(500).json({
      error: "Falha ao atualizar o flashcard no banco de dados.",
      details: error.message,
    });
  }
});

app.delete('/api/flashcards/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const flashcardRef = db.collection('flashcards').doc(id);
    const doc = await flashcardRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Flashcard não encontrado para exclusão.' });
    }

    await flashcardRef.delete();

    res.status(200).json({
      message: 'Flashcard excluído com sucesso.',
      id
    });
  } catch (error) {
    console.error("Erro ao excluir flashcard:", error);
    res.status(500).json({
      error: "Falha ao excluir o flashcard no banco de dados.",
      details: error.message,
    });
  }
});

// ── RESUMOS ────────────────────────────────────────────────────────────────

app.get('/api/resumos', async (req, res) => {
  try {
    const snapshot = await db.collection('resumos').orderBy('createdAt', 'asc').get();
    const resumos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(resumos);
  } catch (error) {
    console.error('Erro ao buscar resumos:', error);
    res.status(500).json({ error: 'Falha ao buscar resumos.', details: error.message });
  }
});

app.post('/api/resumos', async (req, res) => {
  const { topic, html } = req.body;
  if (!topic || !html) {
    return res.status(400).json({ error: 'Os campos "topic" e "html" são obrigatórios.' });
  }
  try {
    const newResumo = { topic, html, createdAt: new Date().toISOString() };
    const docRef = await db.collection('resumos').add(newResumo);
    return res.status(201).json({ message: 'Resumo salvo com sucesso.', id: docRef.id, resumo: newResumo });
  } catch (error) {
    console.error('Erro ao salvar resumo:', error);
    return res.status(500).json({ error: 'Falha ao salvar o resumo.', details: error.message });
  }
});

app.delete('/api/resumos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const ref = db.collection('resumos').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Resumo não encontrado.' });
    await ref.delete();
    res.status(200).json({ message: 'Resumo excluído com sucesso.', id });
  } catch (error) {
    console.error('Erro ao excluir resumo:', error);
    res.status(500).json({ error: 'Falha ao excluir o resumo.', details: error.message });
  }
});

// ── DICIONÁRIOS ─────────────────────────────────────────────────────────────

app.get('/api/dicionarios', async (req, res) => {
  try {
    const snapshot = await db.collection('dicionarios').orderBy('createdAt', 'asc').get();
    const dicionarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(dicionarios);
  } catch (error) {
    console.error('Erro ao buscar dicionários:', error);
    res.status(500).json({ error: 'Falha ao buscar dicionários.', details: error.message });
  }
});

app.post('/api/dicionarios', async (req, res) => {
  const { topic, html, termsCount } = req.body;
  if (!topic || !html) {
    return res.status(400).json({ error: 'Os campos "topic" e "html" são obrigatórios.' });
  }
  try {
    const newDicionario = { topic, html, termsCount: termsCount || 0, createdAt: new Date().toISOString() };
    const docRef = await db.collection('dicionarios').add(newDicionario);
    return res.status(201).json({ message: 'Dicionário salvo com sucesso.', id: docRef.id, dicionario: newDicionario });
  } catch (error) {
    console.error('Erro ao salvar dicionário:', error);
    return res.status(500).json({ error: 'Falha ao salvar o dicionário.', details: error.message });
  }
});

app.delete('/api/dicionarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const ref = db.collection('dicionarios').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Dicionário não encontrado.' });
    await ref.delete();
    res.status(200).json({ message: 'Dicionário excluído com sucesso.', id });
  } catch (error) {
    console.error('Erro ao excluir dicionário:', error);
    res.status(500).json({ error: 'Falha ao excluir o dicionário.', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
