import { CheckCircle, AlertTriangle, XCircle, BookOpen } from 'lucide-react';
import { EvaluationResult as EvalResult } from '@/lib/answer-evaluator';

interface EvaluationResultProps {
  result: EvalResult;
}

export function EvaluationResult({ result }: EvaluationResultProps) {
  const { similarityPercentage, justification, missingElements, referenceExcerpts } = result;
  
  const getScoreColor = () => {
    if (similarityPercentage >= 80) return 'text-green-500';
    if (similarityPercentage >= 60) return 'text-yellow-500';
    if (similarityPercentage >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreIcon = () => {
    if (similarityPercentage >= 80) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (similarityPercentage >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getScoreBg = () => {
    if (similarityPercentage >= 80) return 'bg-green-500/10 border-green-500/20';
    if (similarityPercentage >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    if (similarityPercentage >= 40) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-4">
      {/* Score Header */}
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${getScoreBg()}`}>
        {getScoreIcon()}
        <div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${getScoreColor()}`}>
              {similarityPercentage}%
            </span>
            <span className="text-sm text-muted-foreground">Similarity</span>
          </div>
        </div>
      </div>

      {/* Justification */}
      <div className="text-sm text-foreground leading-relaxed">
        {justification}
      </div>

      {/* Missing Elements */}
      {missingElements.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Missing / Incorrect Elements
          </h4>
          <ul className="space-y-1">
            {missingElements.map((element, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-orange-500 mt-0.5">•</span>
                <span className="capitalize">{element}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reference Excerpts */}
      {referenceExcerpts.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <BookOpen className="w-3 h-3" />
            Reference Excerpts
          </h4>
          <div className="space-y-2">
            {referenceExcerpts.map((excerpt, i) => (
              <blockquote 
                key={i} 
                className="text-xs text-muted-foreground bg-muted/50 p-3 rounded border-l-2 border-primary/30 font-mono"
              >
                {excerpt}
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
