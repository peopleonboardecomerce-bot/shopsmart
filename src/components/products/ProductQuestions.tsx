import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Loader2, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ProductQuestionsProps {
  productId: string;
}

interface Question {
  id: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
}

export const ProductQuestions = ({ productId }: ProductQuestionsProps) => {
  const { user, isAuthenticated } = useAuth();
  const [newQuestion, setNewQuestion] = useState("");
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["product-questions", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_questions")
        .select("id, question, answer, answered_at, created_at, product_id")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Question[];
    },
  });

  const submitQuestion = useMutation({
    mutationFn: async (question: string) => {
      const { error } = await supabase.from("product_questions").insert({
        product_id: productId,
        user_id: user!.id,
        question: question.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-questions", productId] });
      setNewQuestion("");
      toast.success("Pregunta enviada correctamente");
    },
    onError: () => {
      toast.error("Error al enviar la pregunta");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    if (!isAuthenticated) {
      toast.info("Inicia sesión para hacer una pregunta");
      return;
    }
    submitQuestion.mutate(newQuestion);
  };

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Preguntas sobre el producto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form to ask a question */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder={
              isAuthenticated
                ? "Escribe tu pregunta sobre este producto..."
                : "Inicia sesión para hacer una pregunta"
            }
            value={newQuestion}
            onChange={(e) => {
              if (e.target.value.length <= 1000) {
                setNewQuestion(e.target.value);
              }
            }}
            disabled={!isAuthenticated || submitQuestion.isPending}
            className="min-h-[80px]"
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newQuestion.length}/1000
            </span>
            <Button
              type="submit"
              disabled={!isAuthenticated || !newQuestion.trim() || submitQuestion.isPending}
            >
              {submitQuestion.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Enviar pregunta
            </Button>
          </div>
        </form>

        {/* Questions list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aún no hay preguntas sobre este producto. ¡Sé el primero en preguntar!
            </p>
          ) : (
            questions.map((q) => (
              <div
                key={q.id}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                {/* Question */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(q.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>

                {/* Answer */}
                {q.answer ? (
                  <div className="flex items-start gap-3 ml-6 pl-5 border-l-2 border-primary/30">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          Vendedor
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{q.answer}</p>
                      {q.answered_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(q.answered_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="ml-11 text-sm text-muted-foreground italic">
                    Esperando respuesta...
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
