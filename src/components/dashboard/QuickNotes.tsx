import { useState } from 'react';
import { Plus, Trash2, StickyNote, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Note } from '@/types/dashboard';
import { cn } from '@/lib/utils';

const noteColors = [
  'bg-yellow-100 border-yellow-200',
  'bg-blue-100 border-blue-200',
  'bg-green-100 border-green-200',
  'bg-pink-100 border-pink-200',
  'bg-purple-100 border-purple-200',
  'bg-orange-100 border-orange-200',
];

export const QuickNotes = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('student-notes', []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(noteColors[0]);

  const addNote = () => {
    if (!newTitle.trim() && !newContent.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      title: newTitle || 'Untitled',
      content: newContent,
      color: selectedColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setNotes([note, ...notes]);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const updateNote = (id: string, title: string, content: string) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, title, content, updatedAt: new Date().toISOString() } 
        : note
    ));
    setEditingId(null);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <Card className="gradient-card border shadow-soft hover-lift">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <StickyNote className="w-4 h-4 text-accent-foreground" />
            </div>
            Quick Notes
          </CardTitle>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            size="sm"
            variant={isAdding ? 'secondary' : 'default'}
            className={!isAdding ? 'gradient-accent' : ''}
          >
            <Plus className="w-4 h-4 mr-1" />
            {isAdding ? 'Cancel' : 'Add'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="space-y-3 p-4 rounded-lg border bg-background animate-fade-in">
            <Input
              placeholder="Note title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Write your note..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {noteColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-transform",
                      color,
                      selectedColor === color && "scale-125 ring-2 ring-primary"
                    )}
                  />
                ))}
              </div>
              <Button onClick={addNote} size="sm" className="gradient-primary">
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {notes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 col-span-2">
              No notes yet. Click "Add" to create one!
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "p-4 rounded-lg border transition-all animate-fade-in",
                  note.color
                )}
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Input
                      defaultValue={note.title}
                      id={`title-${note.id}`}
                      className="bg-background/50"
                    />
                    <Textarea
                      defaultValue={note.content}
                      id={`content-${note.id}`}
                      rows={2}
                      className="bg-background/50"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const title = (document.getElementById(`title-${note.id}`) as HTMLInputElement).value;
                        const content = (document.getElementById(`content-${note.id}`) as HTMLTextAreaElement).value;
                        updateNote(note.id, title, content);
                      }}
                    >
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground truncate">{note.title}</h4>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => setEditingId(note.id)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 hover:text-destructive"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 mt-1 line-clamp-3">{note.content}</p>
                    <p className="text-xs text-foreground/50 mt-2">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
