"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface TypewriterBadgesProps {
  prompts: string[];
  onBadgeClick?: (prompt: string) => void;
  badgeClassName?: string;
  containerClassName?: string;
  typingSpeed?: number; // ms per character
  delayBetweenPrompts?: number; // ms
  initialDelay?: number; // ms before starting the first prompt
}

const TypewriterBadges: React.FC<TypewriterBadgesProps> = ({
  prompts,
  onBadgeClick,
  badgeClassName = "bg-muted hover:bg-muted-foreground/20 text-muted-foreground cursor-pointer transition-colors text-xs sm:text-sm py-1 px-2",
  containerClassName = "flex flex-col items-center w-full mt-3",
  typingSpeed = 20,
  delayBetweenPrompts = 10,
  initialDelay = 10,
}) => {
  const [displayedPromptsContent, setDisplayedPromptsContent] = useState<string[]>([]);
  const [currentPromptAnimatingIndex, setCurrentPromptAnimatingIndex] = useState(0);
  const [currentTextForPrompt, setCurrentTextForPrompt] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (prompts.length > 0) {
      const startTimeout = setTimeout(() => {
        setDisplayedPromptsContent(new Array(prompts.length).fill(''));
        setCurrentPromptAnimatingIndex(0);
        setCurrentTextForPrompt('');
        setIsAnimating(true); // Start the animation process
      }, initialDelay);
      return () => clearTimeout(startTimeout);
    } else {
      setIsAnimating(false); // No prompts, no animation
    }
  }, [prompts, initialDelay]);

  useEffect(() => {
    if (!isAnimating || currentPromptAnimatingIndex >= prompts.length) {
        if (currentPromptAnimatingIndex >= prompts.length) setIsAnimating(false); // All done
        return;
    }

    // Initialize text for the current prompt if it's empty (start of a new prompt)
    if (currentTextForPrompt === '' && prompts[currentPromptAnimatingIndex]) {
        setCurrentTextForPrompt(prompts[currentPromptAnimatingIndex].charAt(0));
        return; // Allow next effect to update displayedPromptsContent
    }

    const targetText = prompts[currentPromptAnimatingIndex];
    if (currentTextForPrompt.length < targetText.length) {
      const timeoutId = setTimeout(() => {
        setCurrentTextForPrompt(targetText.slice(0, currentTextForPrompt.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timeoutId);
    } else {
      // Current prompt finished, move to next after a delay
      if (currentPromptAnimatingIndex < prompts.length - 1) {
        const timeoutId = setTimeout(() => {
          setCurrentPromptAnimatingIndex(prev => prev + 1);
          setCurrentTextForPrompt(''); // Reset for the next prompt
        }, delayBetweenPrompts);
        return () => clearTimeout(timeoutId);
      } else {
        setIsAnimating(false); // All prompts completed
      }
    }
  }, [currentTextForPrompt, currentPromptAnimatingIndex, prompts, typingSpeed, delayBetweenPrompts, isAnimating]);

  useEffect(() => {
    // Update the main array of displayed prompts when currentTextForPrompt changes
    if(isAnimating) {
        setDisplayedPromptsContent(prev => {
          const newContent = [...prev];
          if (currentPromptAnimatingIndex < newContent.length) {
            newContent[currentPromptAnimatingIndex] = currentTextForPrompt;
          }
          return newContent;
        });
    }
  }, [currentTextForPrompt, currentPromptAnimatingIndex, isAnimating]);


  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className={containerClassName}>
      <div className="relative flex items-center justify-center mb-2 h-6">
        <p className="text-xs text-muted-foreground relative">
          Ask m
          <span className="relative">
            e
            <Sparkles className="absolute -top-1 -right-4 h-3 w-3 text-yellow-400 transform rotate-12" />
          </span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {displayedPromptsContent.map((text, index) => (
          prompts[index] ? (
            <Badge
              key={index}
              variant="outline"
              className={`${badgeClassName} ${
                text.length === prompts[index].length ? 'opacity-100 scale-100' : 'opacity-60 scale-95'
              } transform transition-all duration-150`}
              onClick={() => onBadgeClick && text.length === prompts[index].length ? onBadgeClick(prompts[index]) : undefined}
            >
              {text || <span className="opacity-0">.</span>} 
            </Badge>
          ) : null
        ))}
      </div>
    </div>
  );
};

export default TypewriterBadges; 