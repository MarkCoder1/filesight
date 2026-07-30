import { BarChart3, FileType, Trash2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: BarChart3,
    title: 'Analyze Storage',
    description:
      'Understand what is using your space with visual breakdowns by file type and size.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: FileType,
    title: 'Organize Files',
    description: 'Browse files by category — images, documents, installers, and more.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Trash2,
    title: 'Safe Cleanup',
    description:
      'Nothing is deleted automatically. Review recommendations and choose what to trash.',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
];

export function FeatureCards() {
  return (
    <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
      {features.map((feature) => (
        <Card key={feature.title} className="transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}
            >
              <feature.icon className={`h-6 w-6 ${feature.color}`} />
            </div>
            <h3 className="mb-2 text-sm font-semibold">{feature.title}</h3>
            <p className="text-xs text-muted-foreground">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
