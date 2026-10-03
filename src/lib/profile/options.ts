/** Choices shown in onboarding. Keep in sync with the check constraints in the profiles migration. */
export const goalOptions = [
  { value: 'first-job', label: 'Land my first dev job', hint: 'From learning to hired' },
  { value: 'career-switch', label: 'Switch careers', hint: 'Coming from another field' },
  { value: 'level-up', label: 'Level up at work', hint: 'Junior to mid, mid to senior' },
  { value: 'side-project', label: 'Ship a side project', hint: 'Build and launch something real' },
  { value: 'interviews', label: 'Pass technical interviews', hint: 'Algorithms, system design, take-homes' },
  { value: 'freelance', label: 'Freelance or consult', hint: 'Build things for clients' },
] as const

export const experienceOptions = [
  { value: 'new', label: 'Brand new', hint: 'I have not written much code yet' },
  { value: 'some', label: 'Some experience', hint: 'Tutorials, courses or small projects' },
  { value: 'professional', label: 'Working engineer', hint: 'I write code for a job' },
] as const

export type Goal = (typeof goalOptions)[number]['value']
export type Experience = (typeof experienceOptions)[number]['value']

export const limits = {
  displayName: 60,
  bio: 280,
  goalNote: 280,
  avatarBytes: 2 * 1024 * 1024,
} as const

export const avatarTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const

export const isGoal = (v: string): v is Goal => goalOptions.some((g) => g.value === v)
export const isExperience = (v: string): v is Experience => experienceOptions.some((e) => e.value === v)

export const goalLabel = (v: string) => goalOptions.find((g) => g.value === v)?.label ?? v
export const experienceLabel = (v: string | null) => experienceOptions.find((e) => e.value === v)?.label ?? null
