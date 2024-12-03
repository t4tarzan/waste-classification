import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthState {
  currentUser: User | null;
  loading: boolean;
}

export const useAuth = (): AuthState => {
  const [state, setState] = useState<AuthState>({
    currentUser: null,
    loading: true
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setState({
        currentUser: user,
        loading: false
      });
    });

    return unsubscribe;
  }, []);

  return state;
};
