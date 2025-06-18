import { Artifact } from '@/components/create-artifact';
import { CopyIcon, RedoIcon, UndoIcon } from '@/components/icons';
import { ImageEditor } from '@/components/image-editor';
import { toast } from 'sonner';

export const imageArtifact = new Artifact({
  kind: 'image',
  description: 'Useful for image generation',
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'image-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: ImageEditor,
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy image to clipboard',
      onClick: async ({ content }) => {
        try {
          let imageUrl: string;

          // Handle storage references vs direct base64
          if (content.startsWith('storage:')) {
            const fileId = content.replace('storage:', '');
            imageUrl = `/api/files/${fileId}`;
          } else {
            imageUrl = `data:image/png;base64,${content}`;
          }

          // For storage references, we need to fetch the image first
          if (content.startsWith('storage:')) {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            if (blob) {
              await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob }),
              ]);
              toast.success('Copied image to clipboard!');
            } else {
              throw new Error('Failed to fetch image blob');
            }
          } else {
            // Direct base64 - use the existing method
            const img = new Image();
            img.src = imageUrl;

            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) {
                  navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob }),
                  ]);
                  toast.success('Copied image to clipboard!');
                }
              }, 'image/png');
            };

            img.onerror = () => {
              throw new Error('Failed to load image for copying');
            };
          }
        } catch (error) {
          console.error('Failed to copy image:', error);
          toast.error('Failed to copy image to clipboard');
        }
      },
    },
  ],
  toolbar: [],
});
