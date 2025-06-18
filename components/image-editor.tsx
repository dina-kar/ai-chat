import { LoaderIcon } from './icons';
import cn from 'classnames';
import { useState, useEffect } from 'react';

interface ImageEditorProps {
  title: string;
  content: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: string;
  isInline: boolean;
}

export function ImageEditor({
  title,
  content,
  status,
  isInline,
}: ImageEditorProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!content) {
      setImageUrl('');
      return;
    }

    // Check if content is a storage reference
    if (content.startsWith('storage:')) {
      const fileId = content.replace('storage:', '');
      setImageUrl(`/api/files/${fileId}`);
    } else {
      // Direct base64 content
      setImageUrl(`data:image/png;base64,${content}`);
    }
  }, [content]);

  return (
    <div
      className={cn('flex flex-row items-center justify-center w-full', {
        'h-[calc(100dvh-60px)]': !isInline,
        'h-[200px]': isInline,
      })}
    >
      {status === 'streaming' || isLoading ? (
        <div className="flex flex-row gap-4 items-center">
          {!isInline && (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          )}
          <div>Generating Image...</div>
        </div>
      ) : imageUrl ? (
        <picture>
          <img
            className={cn('w-full h-fit max-w-[800px]', {
              'p-0 md:p-20': !isInline,
            })}
            src={imageUrl}
            alt={title}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              console.error('Failed to load image:', imageUrl);
            }}
          />
        </picture>
      ) : (
        <div className="flex flex-row gap-4 items-center text-muted-foreground">
          <div>No image content available</div>
        </div>
      )}
    </div>
  );
}
