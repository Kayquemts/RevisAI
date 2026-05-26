const express = require('express');
const cors = require('cors');
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
  const { content, file_base64, file_type, file_name, mode } = req.body;

  if (!content && !file_base64) {
    return res.status(400).json({ error: 'Envie "content" ou "file_base64".' });
  }

  const client = new LambdaClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const payload = JSON.stringify({
    httpMethod: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, file_base64, file_type, file_name, mode }),
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
