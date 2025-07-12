export interface Word {
  id: number;
  word: string;
  translation: string;
  pronunciation: string;
  image_url?: string;
  audio_url?: string;
  example_sentence?: string;
  lesson_id?: number;
  created_at?: string;
  updated_at?: string;
}
