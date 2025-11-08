import AuthScreen from "../AuthScreen";

export default function AuthScreenExample() {
  return (
    <AuthScreen
      onGoogleSignIn={() => console.log("Google sign in clicked")}
      onAppleSignIn={() => console.log("Apple sign in clicked")}
    />
  );
}
