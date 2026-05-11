import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getProtectedProfileContext } from "@/lib/profile";

export default async function OnboardingPage() {
  const { email, metrics, profile, user } = await getProtectedProfileContext();

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-white noise-bg sm:px-6 lg:px-8">
      <OnboardingForm
        email={profile?.email ?? email}
        metrics={metrics}
        mode="onboarding"
        profile={profile}
        userId={user.id}
      />
    </main>
  );
}
