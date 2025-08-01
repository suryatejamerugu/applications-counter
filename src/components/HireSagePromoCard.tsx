import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Lightbulb } from 'lucide-react';

const HireSagePromoCard: React.FC = () => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          <Lightbulb className="mr-2 h-5 w-5" />
          💡 Ace Your Interviews with HireSage AI
        </CardTitle>
        <CardDescription className="text-foreground/80">
          Use our smart AI-powered tool to prepare for interviews for free.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => window.open('https://hiresageai.netlify.app/', '_blank')}
          className="w-full hover-glow"
          variant="default"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Try HireSage AI
        </Button>
      </CardContent>
    </Card>
  );
};

export default HireSagePromoCard;