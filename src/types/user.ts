interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  profilePicture?: string;
  preferences?: {
    theme?: 'light' | 'dark';
  };
}