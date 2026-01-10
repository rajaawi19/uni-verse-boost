import { useState, useEffect } from 'react';
import { Plus, Trash2, StickyNote, Edit2, Save, Cloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

const noteColors = [
  'bg-primary/10 border-primary/20',
  'bg-accent/10 border-accent/20',
  'bg-success/10 border-success/20',
  'bg-warning/10 border-warning/20',
  'bg-secondary border-border',
  'bg-muted border-border',
];

export const QuickNotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(noteColors[0]);

  // Fetch notes from database
  useEffect(() => {
    if (!user) return;

    const fetchNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error loading notes",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setNotes(data || []);
      }
      setLoading(false);
    };

    fetchNotes();
  }, [user, toast]);

  const addNote = async () => {
    if ((!newTitle.trim() && !newContent.trim()) || !user) return;
    
    setSyncing(true);
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: newTitle || 'Untitled',
        content: newContent,
        color: selectedColor,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding note",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setNotes([data, ...notes]);
      setNewTitle('');
      setNewContent('');
      setIsAdding(false);
    }
    setSyncing(false);
  };

  const updateNote = async (id: string, title: string, content: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ title, content })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating note",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNotes(notes.map(note => 
        note.id === id 
          ? { ...note, title, content, updated_at: new Date().toISOString() } 
          : note
      ));
    }
    setEditingId(null);
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting note",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  if (loading) {
    return (
      <Card className="gradient-card border shadow-soft">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border shadow-soft hover-lift">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <StickyNote className="w-4 h-4 text-accent-foreground" />
            </div>
            Quick Notes
            <Cloud className="w-4 h-4 text-muted-foreground ml-1" />
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
              disabled={syncing}
            />
            <Textarea
              placeholder="Write your note..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              disabled={syncing}
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
              <Button onClick={addNote} size="sm" className="gradient-primary" disabled={syncing}>
                {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                Save
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
                      defaultValue={note.content || ''}
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
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{note.content}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      {new Date(note.updated_at).toLocaleDateString()}
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
