import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Question {
  id: string;
  product_id: string;
  user_id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  products: {
    title: string;
  } | null;
}

export const QuestionsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "answered">("pending");

  const { data: questions, isLoading } = useQuery({
    queryKey: ["admin-questions", filter],
    queryFn: async () => {
      let query = supabase
        .from("product_questions")
        .select(`
          *,
          products:product_id (title)
        `)
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.is("answer", null);
      } else if (filter === "answered") {
        query = query.not("answer", "is", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Question[];
    },
  });

  const answerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error } = await supabase
        .from("product_questions")
        .update({
          answer,
          answered_at: new Date().toISOString(),
          answered_by: user.id,
        })
        .eq("id", questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      queryClient.invalidateQueries({ queryKey: ["product-questions"] });
      setSelectedQuestion(null);
      setAnswerText("");
      toast({
        title: "Respuesta enviada",
        description: "La pregunta ha sido respondida correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta.",
        variant: "destructive",
      });
    },
  });

  const handleAnswer = () => {
    if (!selectedQuestion || !answerText.trim()) return;
    answerMutation.mutate({
      questionId: selectedQuestion.id,
      answer: answerText.trim(),
    });
  };

  const openAnswerDialog = (question: Question) => {
    setSelectedQuestion(question);
    setAnswerText(question.answer || "");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Preguntas</h1>
          <p className="text-muted-foreground">
            Gestiona las preguntas de los clientes sobre productos
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          size="sm"
        >
          Pendientes
        </Button>
        <Button
          variant={filter === "answered" ? "default" : "outline"}
          onClick={() => setFilter("answered")}
          size="sm"
        >
          Respondidas
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          Todas
        </Button>
      </div>

      {questions?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filter === "pending"
                ? "No hay preguntas pendientes"
                : filter === "answered"
                ? "No hay preguntas respondidas"
                : "No hay preguntas"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions?.map((question) => (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium">
                      {question.products?.title || "Producto eliminado"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(question.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <Badge variant={question.answer ? "secondary" : "destructive"}>
                    {question.answer ? "Respondida" : "Pendiente"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Pregunta:</p>
                  <p className="text-foreground">{question.question}</p>
                </div>

                {question.answer && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm font-medium mb-1 text-primary">Respuesta:</p>
                    <p className="text-foreground">{question.answer}</p>
                    {question.answered_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Respondida el{" "}
                        {format(new Date(question.answered_at), "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => openAnswerDialog(question)}
                  variant={question.answer ? "outline" : "default"}
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {question.answer ? "Editar respuesta" : "Responder"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Responder pregunta</DialogTitle>
          </DialogHeader>

          {selectedQuestion && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Producto:</p>
                <p className="font-medium">{selectedQuestion.products?.title}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Pregunta:</p>
                <p>{selectedQuestion.question}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Tu respuesta:</p>
                <Textarea
                  value={answerText}
                  onChange={(e) => {
                    if (e.target.value.length <= 2000) {
                      setAnswerText(e.target.value);
                    }
                  }}
                  placeholder="Escribe tu respuesta aquí..."
                  rows={4}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {answerText.length}/2000
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAnswer}
              disabled={!answerText.trim() || answerMutation.isPending}
            >
              {answerMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Enviar respuesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
