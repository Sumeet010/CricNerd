import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Swords, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  UserPlus, 
  Check, 
  LogOut 
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { inviteService, playerService } from "@/services";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Player, PlayingRole } from "@/types";

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Invite states
  const [inviteDetails, setInviteDetails] = useState<{ tournamentName: string; teamName: string; expiresAt: string } | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Player Profile states
  const [playerProfile, setPlayerProfile] = useState<Player | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Form states for profile creation
  const [profileName, setProfileName] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profileRole, setProfileRole] = useState<PlayingRole>("Batter");
  const [formError, setFormError] = useState<string | null>(null);

  // Acceptance states
  const [submitting, setSubmitting] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // 1. Fetch Invite Details
  useEffect(() => {
    if (!token) {
      setInviteError("Invalid invite token");
      setLoadingInvite(false);
      return;
    }

    async function fetchInvite() {
      try {
        setLoadingInvite(true);
        const details = await inviteService.getByToken(token!);
        setInviteDetails(details);
      } catch (err: any) {
        console.error("Fetch invite error:", err);
        setInviteError(err.message || "Invalid or expired invitation link.");
      } finally {
        setLoadingInvite(false);
      }
    }

    fetchInvite();
  }, [token]);

  // 2. Fetch User Player Profile if authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPlayerProfile(null);
      return;
    }

    // Check if user is player
    const isPlayer = user.role.includes("PLAYER");
    if (!isPlayer) {
      setPlayerProfile(null);
      return;
    }

    async function fetchProfile() {
      try {
        setLoadingProfile(true);
        const res = await playerService.getMe();
        setPlayerProfile(res.player);
        if (user?.name) {
          setProfileName(user.name);
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [isAuthenticated, user]);

  // Handle player profile creation
  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!profileName.trim()) {
      setFormError("Full Name is required");
      setSubmitting(false);
      return;
    }

    const ageNum = parseInt(profileAge);
    if (isNaN(ageNum) || ageNum < 10) {
      setFormError("Age must be a number and at least 10");
      setSubmitting(false);
      return;
    }

    try {
      const res = await playerService.create({
        name: profileName,
        age: ageNum,
        playingRole: profileRole,
      });
      setPlayerProfile(res.player);
    } catch (err: any) {
      console.error("Create profile error:", err);
      setFormError(err.message || "Failed to create player profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle invitation acceptance
  async function handleAcceptInvite() {
    if (!token) return;
    setGeneralError(null);
    setSubmitting(true);

    try {
      await inviteService.accept(token);
      setAcceptSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err: any) {
      console.error("Accept invite error:", err);
      setGeneralError(err.message || "Failed to accept the invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading Invite Link Details
  if (loadingInvite) {
    return (
      <AuthLayout>
        <Card className="w-full bg-[#151518] border border-zinc-800 shadow-xl p-8 text-center">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#fcf8e3]" />
            <p className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">
              Verifying team invitation...
            </p>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // Error fetching Invite Link Details
  if (inviteError) {
    return (
      <AuthLayout>
        <Card className="w-full bg-[#151518] border border-zinc-800 shadow-xl">
          <CardHeader className="text-center pt-8">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-xl text-white font-bold">Invitation Expired</CardTitle>
            <CardDescription className="text-zinc-500 text-xs mt-1">
              {inviteError}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 text-center">
            <Link to="/">
              <Button className="bg-zinc-800 text-white hover:bg-zinc-700 text-xs px-6 py-2 rounded-lg">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // Success screen
  if (acceptSuccess) {
    return (
      <AuthLayout>
        <Card className="w-full bg-[#151518] border border-zinc-800 shadow-xl text-center p-8">
          <CardContent className="pt-6 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-[#fcf8e3] mb-4 stroke-[1.5]" />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Team!</h2>
            <p className="text-zinc-400 text-sm mb-6">
              You have successfully accepted the invitation and joined <strong>{inviteDetails?.teamName}</strong>.
            </p>
            <p className="text-zinc-500 text-xs mb-6">
              Redirecting you to your dashboard...
            </p>
            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
              <div className="bg-[#fcf8e3] h-full w-full animate-[loading-bar_3s_ease-out-in]" style={{ transformOrigin: 'left' }} />
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // Determine current active flow stage
  // Stage 1: Register / Login
  // Stage 2: Create Player Profile
  // Stage 3: Confirm & Accept Invitation
  const isOrganizer = isAuthenticated && user && !user.role.includes("PLAYER");

  return (
    <AuthLayout maxWidthClassName="max-w-md">
      {/* Invite Details Header */}
      <div className="bg-[#151518] border border-zinc-800 rounded-xl p-5 mb-1 text-center">
        <Swords className="w-8 h-8 text-[#fcf8e3] mx-auto mb-2" />
        <h2 className="text-lg font-bold text-white">Join {inviteDetails?.teamName}</h2>
        <p className="text-zinc-400 text-xs mt-1">
          You are invited to compete in the tournament <strong>{inviteDetails?.tournamentName}</strong>
        </p>
        {inviteDetails?.expiresAt && (
          <span className="inline-block mt-3 text-[10px] bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-full text-zinc-500 font-bold uppercase tracking-wider">
            Invitation expires on: {new Date(inviteDetails.expiresAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Organizer Warning Screen */}
      {isOrganizer ? (
        <Card className="w-full bg-[#151518] border border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base text-white font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Organizer Account
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              You are currently logged in as an <strong>Organizer</strong> ({user?.email}). Only accounts registered as <strong>Players</strong> can join tournament teams.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-500 text-xs">
              Please log out and register a Player account, or log in with an existing Player account to accept this invitation.
            </p>
          </CardContent>
          <CardFooter className="flex gap-3 pt-4 border-t border-zinc-800/50 w-full">
            <Button
              onClick={logout}
              className="flex-1 bg-red-950/20 text-red-400 border border-red-900 hover:bg-red-900/30 text-xs py-2"
            >
              <LogOut className="w-4 h-4 mr-2" /> Log Out
            </Button>
            <Link to={`/register?redirect=${encodeURIComponent(window.location.pathname)}`} className="flex-1 block">
              <Button className="w-full bg-[#fcf8e3] text-black hover:bg-[#f5eea5] text-xs py-2">
                Register Player
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ) : !isAuthenticated ? (
        /* Stage 1: Register / Login Prompt */
        <Card className="w-full bg-[#151518] border border-zinc-800 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#fcf8e3] text-black flex items-center justify-center font-bold text-xs">1</div>
              <span className="text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider">Step 1 of 3</span>
            </div>
            <CardTitle className="text-base text-white font-bold">Account Required</CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              To join team rosters and begin tracking your career statistics, you need a Cricnerd account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="grid grid-cols-2 gap-4">
              <Link to={`/register?redirect=${encodeURIComponent(window.location.pathname)}`} className="w-full">
                <button className="w-full p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-center hover:bg-zinc-900/60 transition-all cursor-pointer">
                  <UserPlus className="w-5 h-5 text-[#fcf8e3] mx-auto mb-2" />
                  <span className="text-xs font-bold text-white block">Create Account</span>
                  <span className="text-[9px] text-zinc-500">New to Cricnerd</span>
                </button>
              </Link>
              <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="w-full">
                <button className="w-full p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-center hover:bg-zinc-900/60 transition-all cursor-pointer">
                  <User className="w-5 h-5 text-white mx-auto mb-2" />
                  <span className="text-xs font-bold text-white block">Log In</span>
                  <span className="text-[9px] text-zinc-500">Already have account</span>
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : loadingProfile ? (
        /* Profile Loading State */
        <Card className="w-full bg-[#151518] border border-zinc-800 shadow-xl p-6 text-center">
          <CardContent className="py-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#fcf8e3]" />
            <p className="text-zinc-500 text-xs">Checking player profile...</p>
          </CardContent>
        </Card>
      ) : !playerProfile ? (
        /* Stage 2: Create Player Profile */
        <Card className="w-full bg-[#151518] border border-zinc-800 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#fcf8e3] text-black flex items-center justify-center font-bold text-xs">2</div>
              <span className="text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider">Step 2 of 3</span>
            </div>
            <CardTitle className="text-base text-white font-bold">Create Player Profile</CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Complete your profile details to register on tournament score sheets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-zinc-300 font-medium text-xs">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Sumeet Gupta"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-650 text-xs focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-zinc-300 font-medium text-xs">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 24"
                  value={profileAge}
                  onChange={(e) => setProfileAge(e.target.value)}
                  className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-650 text-xs focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-zinc-300 font-medium text-xs">Playing Role</Label>
                <select
                  id="role"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value as PlayingRole)}
                  className="w-full bg-[#1e1e22] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                >
                  <option value="Batter">Batter</option>
                  <option value="Bowler">Bowler</option>
                  <option value="Allrounder">Allrounder</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 bg-[#fcf8e3] text-black hover:bg-[#f5eea5] text-xs font-semibold py-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...
                  </>
                ) : (
                  <>
                    Create Profile & Proceed <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Stage 3: Confirm & Accept */
        <Card className="w-full bg-[#151518] border border-zinc-800 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#fcf8e3] text-black flex items-center justify-center font-bold text-xs">3</div>
              <span className="text-zinc-400 font-extrabold uppercase text-[10px] tracking-wider">Step 3 of 3</span>
            </div>
            <CardTitle className="text-base text-white font-bold">Accept Invitation</CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Confirm acceptance of invitation as <strong>{playerProfile.fullName}</strong> ({playerProfile.playingRole}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generalError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}
            
            <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Authenticated as <strong>{user?.email}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Player Profile: <strong>{playerProfile.fullName}</strong></span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              onClick={handleAcceptInvite}
              disabled={submitting}
              className="w-full bg-[#fcf8e3] text-black hover:bg-[#f5eea5] text-xs font-semibold py-2.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Accepting Invite...
                </>
              ) : (
                <>
                  Accept Invite & Join Squad
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </AuthLayout>
  );
}
