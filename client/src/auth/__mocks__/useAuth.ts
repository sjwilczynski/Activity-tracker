export const useAuth = () => {
  return {
    isSignedIn: true,
    signOut: async () => {},
    getIdToken: async () => "mock-token-12345",
    user: {
      displayName: "Test User",
      email: "test@example.com",
      photoURL: "https://via.placeholder.com/150",
      uid: "test-user-123",
    },
  };
};
