import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getProtectedProfileContext } from "@/lib/profile";

export default async function ProfileSettingsPage() {
  const { email, metrics, profile, user } = await getProtectedProfileContext();

  return (
    <div className="mx-auto max-w-4xl">
      <OnboardingForm
        email={profile?.email ?? email}
        metrics={metrics}
        mode="profile"
        profile={profile}
        userId={user.id}
      />
    </div>
  );
}
