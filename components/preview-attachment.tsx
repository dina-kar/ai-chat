import type { Attachment } from 'ai';

import { LoaderIcon, FileIcon, ImageIcon } from './icons';

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith('image/')) {
    return (
      <div className="text-blue-500">
        <ImageIcon size={24} />
      </div>
    );
  }
  if (contentType === 'application/pdf') {
    return (
      <div className="text-red-500">
        <FileIcon size={24} />
      </div>
    );
  }
  if (contentType.includes('document') || contentType.includes('word')) {
    return (
      <div className="text-blue-600">
        <FileIcon size={24} />
      </div>
    );
  }
  if (contentType.includes('sheet') || contentType.includes('excel')) {
    return (
      <div className="text-green-600">
        <FileIcon size={24} />
      </div>
    );
  }
  if (contentType.includes('presentation') || contentType.includes('powerpoint')) {
    return (
      <div className="text-orange-600">
        <FileIcon size={24} />
      </div>
    );
  }
  if (contentType.startsWith('text/')) {
    return (
      <div className="text-gray-600">
        <FileIcon size={24} />
      </div>
    );
  }
  if (contentType.startsWith('audio/')) {
    return (
      <div className="text-purple-600">
        <FileIcon size={24} />
      </div>
    );
  }
  if (contentType.startsWith('video/')) {
    return (
      <div className="text-pink-600">
        <FileIcon size={24} />
      </div>
    );
  }
  return (
    <div className="text-muted-foreground">
      <FileIcon size={24} />
    </div>
  );
};

const getFileTypeLabel = (contentType: string) => {
  if (contentType.startsWith('image/')) return 'Image';
  if (contentType === 'application/pdf') return 'PDF';
  if (contentType.includes('document') || contentType.includes('word')) return 'Word';
  if (contentType.includes('sheet') || contentType.includes('excel')) return 'Excel';
  if (contentType.includes('presentation') || contentType.includes('powerpoint')) return 'PowerPoint';
  if (contentType.startsWith('text/')) return 'Text';
  if (contentType.startsWith('audio/')) return 'Audio';
  if (contentType.startsWith('video/')) return 'Video';
  return 'File';
};

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;

  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-2">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center border border-border">
        {contentType ? (
          contentType.startsWith('image') ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? 'An image attachment'}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              {getFileIcon(contentType)}
              <span className="text-xs text-muted-foreground font-medium">
                {getFileTypeLabel(contentType)}
              </span>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center text-muted-foreground">
            <FileIcon size={24} />
          </div>
        )}

        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="animate-spin absolute text-muted-foreground bg-background/80 rounded p-1"
          >
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground max-w-16 truncate" title={name}>
        {name}
      </div>
    </div>
  );
};
