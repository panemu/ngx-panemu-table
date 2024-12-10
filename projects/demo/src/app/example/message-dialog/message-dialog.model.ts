export interface MessageDialogObject {
  content: string;
  type?: 'info' | 'confirm' | 'error';
  title?: string;
  yesLabel?: string;
  noLabel?: string;
  cancelLabel?: string;
}