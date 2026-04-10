'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLogo } from '@/components/app-logo';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { SearchableSelect } from '@/components/searchable-select';
import { colleges } from '@/lib/college-data';
import { courses } from '@/lib/course-data';
import { LiveBackground } from '@/components/live-background';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.41,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

export default function LoginSignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // Use this state to prevent multiple user creation calls during redirect handling
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && !isProcessingRedirect) {
          setIsProcessingRedirect(true);
          const user = result.user;
          const userDocRef = doc(firestore, `users/${user.uid}`);
          const userDocSnapshot = await getDoc(userDocRef);

          if (!userDocSnapshot.exists()) {
            await createUserDocument(user, {
              createdAt: new Date().toISOString(),
              isProfileComplete: false,
            });
          }
          
          toast({
            title: 'Successfully Logged In',
            description: `Welcome, ${user.displayName || 'Student'}!`,
          });
          router.push('/dashboard');
        }
      } catch (error: any) {
        console.error('Firebase Auth Redirect Error:', error);
        if (error.code === 'auth/redirect-cancelled-by-user') {
          toast({
            title: 'Login cancelled',
            description: 'The sign-in process was stopped by the user.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Login Error',
            description: error.message || 'An error occurred during redirect sign-in. Check authorized domains.',
          });
        }
      } finally {
        setIsProcessingRedirect(false);
      }
    };

    handleRedirectResult();
  }, [auth, firestore, toast, router]);

  useEffect(() => {
    if (user && !isUserLoading && !isProcessingRedirect) {
      if (user.emailVerified) {
        const checkUserDoc = async () => {
          try {
            const userDocRef = doc(firestore, `users/${user.uid}`);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists() || !userDoc.data().college) {
              router.push('/welcome');
            } else {
              router.push('/dashboard');
            }
          } catch (error) {
            console.error('Check user doc error:', error);
          }
        };
        checkUserDoc();
      }
    }
  }, [user, isUserLoading, firestore, router, isProcessingRedirect]);

  const createUserDocument = async (user: User, additionalData: object) => {
    if (!user) return;
    const userRef = doc(firestore, `users/${user.uid}`);
    const userData = {
      id: user.uid,
      email: user.email,
      fullName: user.displayName || signupFullName || '',
      ...additionalData,
    };
    await setDoc(userRef, userData, { merge: true });
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    if (!signupEmail || !signupPassword || !college || !course || !semester) {
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: 'Please fill in all the required fields.',
      });
      setIsLoading(false);
      return;
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );
      
      const additionalData = {
        college,
        course,
        semester: Number(semester),
        createdAt: new Date().toISOString(),
        isProfileComplete: true,
      };
      await createUserDocument(userCredential.user, additionalData);
      await sendEmailVerification(userCredential.user);

      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox to verify your email address.',
      });
    } catch (error: any) {
      console.error('Sign-up Error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign-up Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      if (!userCredential.user.emailVerified) {
        toast({
          variant: 'destructive',
          title: 'Email Not Verified',
          description: 'Please verify your email before logging in.',
        });
        await auth.signOut();
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: 'google') => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      // Ensure persistence is set before redirecting
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('Social Login Trigger Error:', error);
      toast({
        variant: 'destructive',
        title: 'Social Login Failed',
        description: error.message || 'An unexpected error occurred during redirect initialization.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <LiveBackground />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Link href="/"><AppLogo /></Link>
          </div>
          
          {user && !user.emailVerified && (
             <Alert className="mb-4 bg-card border-primary/20">
              <AlertTitle className="text-primary">Verify Your Email</AlertTitle>
              <AlertDescription>
                A verification link has been sent to your email. Please check your inbox to verify your account.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl p-1 bg-secondary">
              <TabsTrigger value="login" className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="animate-in fade-in slide-in-from-bottom-2">
              <Card className="bg-card/80 backdrop-blur-md border-border shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-black text-primary">Welcome back</CardTitle>
                  <CardDescription className="font-medium text-muted-foreground">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Email</Label>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-lg bg-secondary border-border focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Password</Label>
                    <Input 
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-lg bg-secondary border-border focus:ring-primary"
                    />
                  </div>
                  <div className="text-right text-sm">
                    <Link href="/forgot-password" title="Reset your password" className="text-primary font-bold hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <Button onClick={handleLogin} className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                  </Button>
                </CardContent>
                <CardFooter className="flex-col space-y-4 pb-8">
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                      <span className="bg-card px-3">Or continue with</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-2xl gap-3 border-border bg-secondary hover:bg-secondary/80 font-bold shadow-sm transition-all hover:shadow-md" 
                    onClick={() => handleSocialLogin('google')} 
                    disabled={isLoading}
                  >
                    <GoogleIcon className="h-5 w-5" />
                    Sign in with Google
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="signup" className="animate-in fade-in slide-in-from-bottom-2">
              <Card className="bg-card/80 backdrop-blur-md border-border shadow-2xl rounded-2xl">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-black text-primary">Create an account</CardTitle>
                  <CardDescription className="font-medium text-muted-foreground">
                    Enter your information to get started with Zenora
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Full Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-lg bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Email</Label>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-lg bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Password</Label>
                    <Input 
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-lg bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">College Name</Label>
                     <SearchableSelect
                        value={college}
                        onChange={setCollege}
                        placeholder="Select College"
                        disabled={isLoading}
                        options={colleges.map(c => ({ value: c, label: c }))}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Course</Label>
                      <SearchableSelect
                        value={course}
                        onChange={setCourse}
                        placeholder="Select Course"
                        disabled={isLoading}
                        options={courses}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Semester</Label>
                      <SearchableSelect
                        value={semester}
                        onChange={setSemester}
                        placeholder="Select Sem"
                        disabled={isLoading}
                        options={[...Array(8)].map((_, i) => ({ value: `${i + 1}`, label: `Sem ${i + 1}` }))}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSignUp} className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-bold text-lg mt-4 hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
