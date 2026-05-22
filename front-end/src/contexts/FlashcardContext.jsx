import { createContext, useContext, useState } from "react";
import { themes as initialThemes, weeks as initialWeeks } from "../data/mockData";

const FlashcardContext = createContext(null);

export const useFlashcards = () => {
  const ctx = useContext(FlashcardContext);
  if (!ctx) throw new Error("useFlashcards must be used within FlashcardProvider");
  return ctx;
};

export const FlashcardProvider = ({ children }) => {
  const [themes, setThemes] = useState(initialThemes);
  const [weeks, setWeeks] = useState(initialWeeks);
  const [cardStats, setCardStats] = useState({});
  const [weekLinks, setWeekLinks] = useState([
    { weekId: 1, flashcardIds: [] },
    { weekId: 2, flashcardIds: [] },
    { weekId: 3, flashcardIds: [] },
    { weekId: 4, flashcardIds: [] },
  ]);

  const recordAnswer = (cardId, correct) => {
    setCardStats(prev => {
      const cur = prev[cardId] || { correct: 0, wrong: 0 };
      return {
        ...prev,
        [cardId]: correct
          ? { ...cur, correct: cur.correct + 1 }
          : { ...cur, wrong: cur.wrong + 1 },
      };
    });
  };

  const hasReviewHistory = Object.keys(cardStats).length > 0;

  const getThemePriorities = () => {
    const result = themes.map(theme => {
      let correct = 0, wrong = 0;
      const wrongCardIds = [];
      theme.cards.forEach(c => {
        const s = cardStats[c.id];
        if (s) {
          correct += s.correct;
          wrong += s.wrong;
          if (s.wrong > s.correct) wrongCardIds.push(c.id);
        }
      });
      const total = correct + wrong;
      const errorRate = total > 0 ? wrong / total : 0;
      const priority =
        errorRate >= 0.5 ? 'alta' : errorRate >= 0.25 ? 'media' : 'baixa';
      return {
        themeId: theme.id,
        themeName: theme.name,
        errorRate,
        totalAttempts: total,
        wrongCardIds,
        priority,
      };
    }).filter(t => t.totalAttempts > 0);
    return result.sort((a, b) => b.errorRate - a.errorRate);
  };

  const addGeneratedCards = (themeName, cards) => {
    setThemes(prev => {
      const existing = prev.find(t => t.name === themeName);
      if (existing) {
        return prev.map(t =>
          t.name === themeName ? { ...t, cards: [...t.cards, ...cards] } : t
        );
      }
      const newTheme = {
        id: String(prev.length + 1),
        name: themeName,
        description: `Cards sobre ${themeName}`,
        progress: 0,
        cards,
      };
      return [...prev, newTheme];
    });
  };

  const linkCardsToWeek = (weekId, cardIds) => {
    setWeekLinks(prev =>
      prev.map(wl =>
        wl.weekId === weekId
          ? { ...wl, flashcardIds: [...new Set([...wl.flashcardIds, ...cardIds])] }
          : wl
      )
    );
  };

  const unlinkCardsFromWeek = (weekId, cardIds) => {
    setWeekLinks(prev =>
      prev.map(wl =>
        wl.weekId === weekId
          ? { ...wl, flashcardIds: wl.flashcardIds.filter(id => !cardIds.includes(id)) }
          : wl
      )
    );
  };

  const getAllCards = () => {
    return themes.flatMap(t => t.cards);
  };

  const getCardsForWeek = (weekId) => {
    const link = weekLinks.find(wl => wl.weekId === weekId);
    if (!link) return [];
    const allCards = getAllCards();
    if (weekId === 4) return allCards;
    return allCards.filter(c => link.flashcardIds.includes(c.id));
  };

  const updateWeekDayTopics = (weekId, dayIndex, topics) => {
    setWeeks(prev =>
      prev.map(w =>
        w.id === weekId
          ? {
              ...w,
              days: w.days.map((d, i) => i === dayIndex ? { ...d, topics } : d),
            }
          : w
      )
    );
  };

  const updateCard = (cardId, question, answer) => {
    setThemes(prev =>
      prev.map(t => ({
        ...t,
        cards: t.cards.map(c => c.id === cardId ? { ...c, question, answer } : c),
      }))
    );
  };

  const removeCard = (cardId) => {
    setThemes(prev =>
      prev.map(t => ({
        ...t,
        cards: t.cards.filter(c => c.id !== cardId),
      })).filter(t => t.cards.length > 0) // Opcional: remove o tema se ficar vazio
    );
  };

  return (
    <FlashcardContext.Provider value={{
      themes, weeks, weekLinks, addGeneratedCards,
      linkCardsToWeek, unlinkCardsFromWeek, getCardsForWeek, getAllCards,
      updateWeekDayTopics, updateCard, removeCard,
      recordAnswer, cardStats, hasReviewHistory, getThemePriorities,
    }}>
      {children}
    </FlashcardContext.Provider>
  );
};

