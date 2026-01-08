import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Brain, Plus, RotateCcw, Trash2, Play, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deck: string;
  createdAt: string;
  // SM-2 algorithm fields
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
}

interface Deck {
  id: string;
  name: string;
  color: string;
}

const DECK_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
];

export function FlashcardSystem() {
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('student-flashcards', []);
  const [decks, setDecks] = useLocalStorage<Deck[]>('student-decks', [
    { id: 'default', name: 'General', color: 'bg-blue-500' }
  ]);
  
  const [isStudying, setIsStudying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [selectedDeck, setSelectedDeck] = useState('default');
  const [newDeckName, setNewDeckName] = useState('');

  // Get cards due for review
  const getDueCards = () => {
    const now = new Date().toISOString();
    return flashcards.filter(card => card.nextReview <= now);
  };

  // SM-2 Algorithm implementation
  const calculateNextReview = (card: Flashcard, quality: number): Flashcard => {
    let { easeFactor, interval, repetitions } = card;

    if (quality < 3) {
      // Failed - reset
      repetitions = 0;
      interval = 1;
    } else {
      // Success
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Update ease factor
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ...card,
      easeFactor,
      interval,
      repetitions,
      nextReview: nextReview.toISOString(),
    };
  };

  const addFlashcard = () => {
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newFront.trim(),
      back: newBack.trim(),
      deck: selectedDeck,
      createdAt: new Date().toISOString(),
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: new Date().toISOString(),
    };

    setFlashcards([...flashcards, newCard]);
    setNewFront('');
    setNewBack('');
  };

  const addDeck = () => {
    if (!newDeckName.trim()) return;

    const newDeck: Deck = {
      id: Date.now().toString(),
      name: newDeckName.trim(),
      color: DECK_COLORS[decks.length % DECK_COLORS.length],
    };

    setDecks([...decks, newDeck]);
    setNewDeckName('');
  };

  const deleteDeck = (deckId: string) => {
    if (deckId === 'default') return;
    setDecks(decks.filter(d => d.id !== deckId));
    setFlashcards(flashcards.filter(c => c.deck !== deckId));
  };

  const deleteCard = (cardId: string) => {
    setFlashcards(flashcards.filter(c => c.id !== cardId));
  };

  const startStudySession = (deckId?: string) => {
    let cardsToStudy = getDueCards();
    if (deckId) {
      cardsToStudy = cardsToStudy.filter(c => c.deck === deckId);
    }
    
    // Shuffle cards
    cardsToStudy.sort(() => Math.random() - 0.5);
    
    if (cardsToStudy.length === 0) {
      // If no due cards, study all cards from the deck
      cardsToStudy = deckId 
        ? flashcards.filter(c => c.deck === deckId)
        : [...flashcards];
      cardsToStudy.sort(() => Math.random() - 0.5);
    }

    if (cardsToStudy.length > 0) {
      setStudyQueue(cardsToStudy);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setIsStudying(true);
    }
  };

  const handleAnswer = (quality: number) => {
    const currentCard = studyQueue[currentCardIndex];
    const updatedCard = calculateNextReview(currentCard, quality);
    
    setFlashcards(flashcards.map(c => 
      c.id === currentCard.id ? updatedCard : c
    ));

    if (currentCardIndex < studyQueue.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      setIsStudying(false);
      setStudyQueue([]);
    }
  };

  const getDeckStats = (deckId: string) => {
    const deckCards = flashcards.filter(c => c.deck === deckId);
    const dueCards = deckCards.filter(c => c.nextReview <= new Date().toISOString());
    return { total: deckCards.length, due: dueCards.length };
  };

  const dueCount = getDueCards().length;

  if (isStudying && studyQueue.length > 0) {
    const currentCard = studyQueue[currentCardIndex];
    const deck = decks.find(d => d.id === currentCard.deck);

    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Study Session
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {currentCardIndex + 1} / {studyQueue.length}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setIsStudying(false)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {deck && (
            <Badge className={`${deck.color} text-white`}>{deck.name}</Badge>
          )}
          
          <div 
            className="min-h-[200px] flex items-center justify-center p-6 bg-muted/50 rounded-lg cursor-pointer transition-all hover:bg-muted/70"
            onClick={() => setShowAnswer(true)}
          >
            <div className="text-center">
              {!showAnswer ? (
                <>
                  <p className="text-lg font-medium mb-2">{currentCard.front}</p>
                  <p className="text-sm text-muted-foreground">Click to reveal answer</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">{currentCard.front}</p>
                  <div className="border-t border-border my-3"></div>
                  <p className="text-lg font-medium">{currentCard.back}</p>
                </>
              )}
            </div>
          </div>

          {showAnswer && (
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">How well did you remember?</p>
              <div className="grid grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  className="flex flex-col h-auto py-3 border-red-500/50 hover:bg-red-500/10"
                  onClick={() => handleAnswer(1)}
                >
                  <XCircle className="w-4 h-4 text-red-500 mb-1" />
                  <span className="text-xs">Again</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex flex-col h-auto py-3 border-orange-500/50 hover:bg-orange-500/10"
                  onClick={() => handleAnswer(3)}
                >
                  <Clock className="w-4 h-4 text-orange-500 mb-1" />
                  <span className="text-xs">Hard</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex flex-col h-auto py-3 border-blue-500/50 hover:bg-blue-500/10"
                  onClick={() => handleAnswer(4)}
                >
                  <CheckCircle className="w-4 h-4 text-blue-500 mb-1" />
                  <span className="text-xs">Good</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex flex-col h-auto py-3 border-green-500/50 hover:bg-green-500/10"
                  onClick={() => handleAnswer(5)}
                >
                  <Sparkles className="w-4 h-4 text-green-500 mb-1" />
                  <span className="text-xs">Easy</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Flashcards
          </CardTitle>
          {dueCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {dueCount} due
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="study" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="decks">Decks</TabsTrigger>
          </TabsList>

          <TabsContent value="study" className="space-y-3">
            {flashcards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No flashcards yet</p>
                <p className="text-sm">Create some cards to start studying!</p>
              </div>
            ) : (
              <>
                <Button 
                  className="w-full" 
                  onClick={() => startStudySession()}
                  disabled={flashcards.length === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Study All ({flashcards.length} cards)
                </Button>
                
                <div className="space-y-2">
                  {decks.map(deck => {
                    const stats = getDeckStats(deck.id);
                    if (stats.total === 0) return null;
                    
                    return (
                      <div 
                        key={deck.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${deck.color}`}></div>
                          <div>
                            <p className="font-medium text-sm">{deck.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {stats.total} cards • {stats.due} due
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => startStudySession(deck.id)}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-3">
            <div className="space-y-2">
              <Input
                placeholder="Question / Front side"
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
              />
              <Textarea
                placeholder="Answer / Back side"
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                rows={3}
              />
              <select
                value={selectedDeck}
                onChange={(e) => setSelectedDeck(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
              >
                {decks.map(deck => (
                  <option key={deck.id} value={deck.id}>{deck.name}</option>
                ))}
              </select>
              <Button className="w-full" onClick={addFlashcard}>
                <Plus className="w-4 h-4 mr-2" />
                Add Flashcard
              </Button>
            </div>

            {flashcards.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <p className="text-sm font-medium text-muted-foreground">Recent Cards</p>
                {flashcards.slice(-5).reverse().map(card => {
                  const deck = decks.find(d => d.id === card.deck);
                  return (
                    <div 
                      key={card.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${deck?.color || 'bg-gray-500'} flex-shrink-0`}></div>
                        <p className="text-sm truncate">{card.front}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteCard(card.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="decks" className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="New deck name"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDeck()}
              />
              <Button onClick={addDeck}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {decks.map(deck => {
                const stats = getDeckStats(deck.id);
                return (
                  <div 
                    key={deck.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${deck.color}`}></div>
                      <div>
                        <p className="font-medium text-sm">{deck.name}</p>
                        <p className="text-xs text-muted-foreground">{stats.total} cards</p>
                      </div>
                    </div>
                    {deck.id !== 'default' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteDeck(deck.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
