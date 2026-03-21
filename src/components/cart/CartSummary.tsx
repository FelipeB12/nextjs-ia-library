import { BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartSummaryProps {
  count: number;
  loading: boolean;
  onCheckout: () => void;
}

/**
 * Cart summary panel showing item count, borrow policy reminder,
 * and the checkout button.
 */
export default function CartSummary({ count, loading, onCheckout }: CartSummaryProps) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4 h-fit">
      <h2 className="font-semibold text-lg">Order Summary</h2>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Books to borrow</span>
        <span className="font-medium">{count}</span>
      </div>

      <div className="border-t pt-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Borrow period: 30 days from approval</span>
        </div>
        <div className="flex items-start gap-2">
          <BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Each request is reviewed by a librarian before approval</span>
        </div>
      </div>

      <Button
        onClick={onCheckout}
        disabled={count === 0 || loading}
        className="w-full"
        size="lg"
      >
        {loading ? "Submitting…" : "Submit Borrow Request"}
      </Button>
    </div>
  );
}
