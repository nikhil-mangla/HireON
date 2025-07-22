// import { GoogleLogin } from '@react-oauth/google';
// import { useAuth } from '../hooks/useAuth.jsx';

// const GoogleLoginButton = () => {
//   const { loginWithGoogle } = useAuth();

//   const handleGoogleSuccess = async (credentialResponse) => {
//     try {
//       await loginWithGoogle(credentialResponse.credential);
//     } catch (error) {
//       console.error('Google login failed:', error);
//     }
//   };

//   const handleGoogleError = () => {
//     console.error('Google login failed');
//   };

//   return (
//     <div className="w-full">
//       <GoogleLogin
//         onSuccess={handleGoogleSuccess}
//         onError={handleGoogleError}
//         theme="outline"
//         size="large"
//         width="100%"
//         text="signin_with"
//         shape="rectangular"
//         logo_alignment="left"
//       />
//     </div>
//   );
// };

// export default GoogleLoginButton;
// Google login temporarily disabled

