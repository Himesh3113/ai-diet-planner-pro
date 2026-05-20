export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

export interface DayRoutine {
  focus: string;
  exercises: Exercise[];
}

export type WeeklySchedule = Record<string, DayRoutine>;

export interface WorkoutTemplate {
  difficulty: "beginner" | "intermediate" | "advanced";
  mode: "home" | "gym";
  weekly_schedule: WeeklySchedule;
}

export const WORKOUT_TEMPLATES: Record<string, WeeklySchedule> = {
  "home-beginner": {
    monday: {
      focus: "Full Body Strength",
      exercises: [
        { name: "Bodyweight Squats", sets: 3, reps: "15 reps", notes: "Focus on deep range and upright torso." },
        { name: "Incline Push-ups", sets: 3, reps: "10-12 reps", notes: "Use a sturdy chair or couch." },
        { name: "Glute Bridges", sets: 3, reps: "15 reps", notes: "Squeeze glutes at the top for 2 seconds." },
        { name: "Doorway / Table Rows", sets: 3, reps: "8-10 reps", notes: "Keep body straight, pull chest to edge." },
        { name: "Plank Hold", sets: 3, reps: "30-45 sec", notes: "Brace core, don't let hips sag." }
      ]
    },
    tuesday: {
      focus: "Active Recovery & Mobility",
      exercises: [
        { name: "Cat-Cow Stretch", sets: 2, reps: "10 reps", notes: "Move slowly with your breathing." },
        { name: "World's Greatest Stretch", sets: 2, reps: "6 per side", notes: "Step forward, rotate chest up." },
        { name: "Light Walking", sets: 1, reps: "20-30 mins", notes: "Low intensity outdoor walk." }
      ]
    },
    wednesday: {
      focus: "Lower Body & Core Focus",
      exercises: [
        { name: "Reverse Lunges", sets: 3, reps: "10 per leg", notes: "Step back smoothly, keep balance." },
        { name: "Single-Leg Calf Raises", sets: 3, reps: "15 per leg", notes: "Hold wall for balance if needed." },
        { name: "Bird-Dog", sets: 3, reps: "12 reps alternating", notes: "Extend opposite arm and leg straight." },
        { name: "Deadbug", sets: 3, reps: "10 per side", notes: "Keep lower back flat against the floor." }
      ]
    },
    thursday: {
      focus: "Rest & Restorative Yoga",
      exercises: [
        { name: "Child's Pose", sets: 1, reps: "2 mins", notes: "Breathe deeply into your lower back." },
        { name: "Cobra Stretch", sets: 2, reps: "30 sec", notes: "Gentle stretch for the abdominal wall." }
      ]
    },
    friday: {
      focus: "Upper Body & Conditioning",
      exercises: [
        { name: "Knee Push-ups", sets: 3, reps: "10-12 reps", notes: "Maintain straight line from head to knees." },
        { name: "Pike Push-ups", sets: 3, reps: "8 reps", notes: "Hips high, targets shoulders." },
        { name: "Prone Y-T-Ws", sets: 3, reps: "10 reps each", notes: "Lying face down, raise arms in Y, T, W shapes." },
        { name: "Flutter Crunches", sets: 3, reps: "20 reps", notes: "Keep shoulder blades slightly lifted." }
      ]
    },
    saturday: {
      focus: "Light HIIT & Cardio",
      exercises: [
        { name: "Jacking Jacks", sets: 3, reps: "45 sec", notes: "Keep a steady, rhythmic pace." },
        { name: "Shadow Boxing", sets: 3, reps: "1 min", notes: "Active arms and light bouncing on feet." },
        { name: "Mountain Climbers", sets: 3, reps: "30 sec", notes: "Keep hips low, drive knees in." }
      ]
    },
    sunday: {
      focus: "Full Body Rest",
      exercises: [
        { name: "Deep Breathing & Meditation", sets: 1, reps: "10 mins", notes: "Relax and let muscles recover." }
      ]
    }
  },
  "home-intermediate": {
    monday: {
      focus: "Upper Body Push & Pull",
      exercises: [
        { name: "Standard Push-ups", sets: 4, reps: "12-15 reps", notes: "Chest to floor, elbows at 45 degrees." },
        { name: "Bed/Table Pull-ups (Under)", sets: 4, reps: "10 reps", notes: "Squeeze shoulder blades together." },
        { name: "Pike Push-ups", sets: 3, reps: "10-12 reps", notes: "Place feet on couch for extra difficulty." },
        { name: "Bench / Chair Dips", sets: 3, reps: "12 reps", notes: "Keep hips close to the chair." }
      ]
    },
    tuesday: {
      focus: "Lower Body Power",
      exercises: [
        { name: "Jump Squats", sets: 4, reps: "12 reps", notes: "Land softly and absorb the force." },
        { name: "Walking Lunges", sets: 3, reps: "15 per leg", notes: "Control the movement down." },
        { name: "Single-Leg Glute Bridges", sets: 3, reps: "10 per leg", notes: "Keep hips level throughout." },
        { name: "Wall Sit", sets: 3, reps: "45-60 sec", notes: "Thighs parallel to floor, back flat." }
      ]
    },
    wednesday: {
      focus: "Core & Stamina HIIT",
      exercises: [
        { name: "Burpees", sets: 3, reps: "10 reps", notes: "Full push-up at bottom if possible." },
        { name: "Bicycle Crunches", sets: 3, reps: "20 reps alternating", notes: "Touch opposite elbow to knee slowly." },
        { name: "Hollow Body Hold", sets: 3, reps: "30 sec", notes: "Keep lower back pressed hard into floor." },
        { name: "Plank-to-Pushup", sets: 3, reps: "12 reps", notes: "Alternate leading arm." }
      ]
    },
    thursday: {
      focus: "Active Recovery & Dynamic Stretch",
      exercises: [
        { name: "Hamstring Scoops", sets: 2, reps: "10 per leg", notes: "Dynamic stretch for back of thighs." },
        { name: "Deep Squat Hold", sets: 2, reps: "1 min", notes: "Keep heels down, open hips with elbows." }
      ]
    },
    friday: {
      focus: "Full Body Hypertrophy",
      exercises: [
        { name: "Decline Push-ups", sets: 3, reps: "12 reps", notes: "Feet elevated on a chair or bed." },
        { name: "Towel Bicep Curls", sets: 3, reps: "15 reps", notes: "Hook towel under knee, lift leg against resistance." },
        { name: "Single-Leg Romanian Deadlifts", sets: 3, reps: "10 per leg", notes: "Hinge at hips, keep back neutral." },
        { name: "Diamond Push-ups", sets: 3, reps: "8-10 reps", notes: "Hands close, targets triceps." }
      ]
    },
    saturday: {
      focus: "HIIT Endurance",
      exercises: [
        { name: "High Knees", sets: 4, reps: "45 sec", notes: "Pump arms, drive knees to chest height." },
        { name: "Skater Hops", sets: 4, reps: "30 sec", notes: "Jump laterally, landing on one foot." },
        { name: "Plank Jacks", sets: 3, reps: "45 sec", notes: "Jump feet out and in while holding plank." }
      ]
    },
    sunday: {
      focus: "Full Body Rest & Mobilize",
      exercises: [
        { name: "Foam Rolling / Self Massage", sets: 1, reps: "15 mins", notes: "Roll out tight spots." }
      ]
    }
  },
  "home-advanced": {
    monday: {
      focus: "Handstand & Upper Push Elite",
      exercises: [
        { name: "Handstand Push-ups (Wall)", sets: 4, reps: "6-8 reps", notes: "HSPUs against wall or deep pike." },
        { name: "Pseudo-Planche Pushups", sets: 4, reps: "10 reps", notes: "Lean forward, fingers pointed back." },
        { name: "One-Arm Push-up Progressions", sets: 3, reps: "5 per side", notes: "Use wide feet for balance." },
        { name: "Deep Chair Dips", sets: 3, reps: "15 reps", notes: "Elevate feet, add backpack for weight." }
      ]
    },
    tuesday: {
      focus: "Unilateral Lower Power",
      exercises: [
        { name: "Pistol Squats (Single Leg)", sets: 4, reps: "6 per leg", notes: "Control down, drive up through heel." },
        { name: "Bulgarian Split Squats", sets: 4, reps: "12 per leg", notes: "Rear foot elevated on bed, hold water jugs." },
        { name: "Single-Leg Glute Bridges (Feet Elevated)", sets: 3, reps: "12 per leg", notes: "Elevate foot on a chair." },
        { name: "Plyometric Jumping Lunges", sets: 3, reps: "20 reps alternating", notes: "Explode up, swap legs in air." }
      ]
    },
    wednesday: {
      focus: "Elite Pull & L-Sit Core",
      exercises: [
        { name: "Door-Frame Pull-ups / Towel Rows", sets: 4, reps: "12 reps", notes: "Heavy resistance towel door pull." },
        { name: "L-Sit Hold on Floor", sets: 4, reps: "15-20 sec", notes: "Press floor away, lift legs straight." },
        { name: "Dragon Flags", sets: 3, reps: "6-8 reps", notes: "Hold sturdy post, lift body in straight line." },
        { name: "Hanging Leg Raises (if bar available)", sets: 3, reps: "12 reps", notes: "Or strict lying leg raises to toes." }
      ]
    },
    thursday: {
      focus: "Rest & Active Recovery",
      exercises: [
        { name: "Mobility Flow", sets: 1, reps: "20 mins", notes: "Thoracic extensions, 90/90 hip stretches." }
      ]
    },
    friday: {
      focus: "Advanced Conditioning & Plyo",
      exercises: [
        { name: "Burpee Pull-ups", sets: 4, reps: "10 reps", notes: "Jump up to pull-up bar, do pull-up." },
        { name: "Tuck Jumps", sets: 3, reps: "12 reps", notes: "Explode up, bring knees to chest." },
        { name: "Handstand Hold", sets: 3, reps: "45 sec", notes: "Free-standing or chest-to-wall." }
      ]
    },
    saturday: {
      focus: "Full Body Tabata Protocol",
      exercises: [
        { name: "Tabata Round 1 (Squat Jumps)", sets: 8, reps: "20s on / 10s off", notes: "Maximum effort." },
        { name: "Tabata Round 2 (Push-ups)", sets: 8, reps: "20s on / 10s off", notes: "Keep strict form." },
        { name: "Tabata Round 3 (V-Ups)", sets: 8, reps: "20s on / 10s off", notes: "Crunch upper and lower body together." }
      ]
    },
    sunday: {
      focus: "Full Recovery & Rejuvenation",
      exercises: [
        { name: "Yoga & Breathwork", sets: 1, reps: "20 mins", notes: "Wim Hof style or deep belly breathing." }
      ]
    }
  },
  "gym-beginner": {
    monday: {
      focus: "Upper Body Pull & Arms",
      exercises: [
        { name: "Lat Pulldown (Machine)", sets: 3, reps: "10-12 reps", notes: "Squeeze lats at the bottom." },
        { name: "Seated Cable Rows", sets: 3, reps: "12 reps", notes: "Keep chest tall, pull to lower belly." },
        { name: "Dumbbell Bicep Curls", sets: 3, reps: "12 reps", notes: "Alternate arms, control the descent." },
        { name: "Face Pulls (Cable)", sets: 3, reps: "15 reps", notes: "Targets rear delts and upper back." }
      ]
    },
    tuesday: {
      focus: "Lower Body Push & Calf",
      exercises: [
        { name: "Leg Press", sets: 3, reps: "10-12 reps", notes: "Don't lock knees at the top." },
        { name: "Dumbbell Goblet Squats", sets: 3, reps: "12 reps", notes: "Hold dumbbell vertically at chest." },
        { name: "Leg Extensions (Machine)", sets: 3, reps: "15 reps", notes: "Hold peak contraction for 1 second." },
        { name: "Standing Calf Raises (Machine)", sets: 3, reps: "15 reps", notes: "Get a deep stretch at bottom." }
      ]
    },
    wednesday: {
      focus: "Active Recovery & Light Cardio",
      exercises: [
        { name: "Incline Treadmill Walk", sets: 1, reps: "25-30 mins", notes: "Speed: 3.5, Incline: 6.0" },
        { name: "Core Crunch Machine", sets: 3, reps: "15 reps", notes: "Control the weight on the way back." }
      ]
    },
    thursday: {
      focus: "Upper Body Push Focus",
      exercises: [
        { name: "Dumbbell Flat Bench Press", sets: 3, reps: "10 reps", notes: "Retract shoulder blades, push upward." },
        { name: "Seated Dumbbell Shoulder Press", sets: 3, reps: "10-12 reps", notes: "Drive dumbbells straight up." },
        { name: "Tricep Pushdowns (Rope)", sets: 3, reps: "12 reps", notes: "Flare rope at the bottom of press." },
        { name: "Lateral Raises (Dumbbell)", sets: 3, reps: "12-15 reps", notes: "Lead with elbows, targets side delts." }
      ]
    },
    friday: {
      focus: "Lower Body Posterior & Core",
      exercises: [
        { name: "Lying Leg Curls (Machine)", sets: 3, reps: "12 reps", notes: "Squeeze hamstrings at the top." },
        { name: "Romanian Deadlift (Dumbbell)", sets: 3, reps: "10 reps", notes: "Push hips back, feel hamstring stretch." },
        { name: "Plank Hold", sets: 3, reps: "45 sec", notes: "Brace abs tightly, breathe." },
        { name: "Hanging Knee Raises", sets: 3, reps: "10 reps", notes: "Bring knees to chest level." }
      ]
    },
    saturday: {
      focus: "Stairmaster & Mobility",
      exercises: [
        { name: "Stairmaster Cardio", sets: 1, reps: "20 mins", notes: "Keep a moderate, sweaty pace." },
        { name: "Full Body Stretch Flow", sets: 1, reps: "15 mins", notes: "Stretch hips, chest, and back." }
      ]
    },
    sunday: {
      focus: "Complete Rest Day",
      exercises: [
        { name: "Muscle Recovery", sets: 1, reps: "N/A", notes: "Eat nutritious foods, sleep 8+ hours." }
      ]
    }
  },
  "gym-intermediate": {
    monday: {
      focus: "Push (Chest, Shoulders, Triceps)",
      exercises: [
        { name: "Barbell Bench Press", sets: 4, reps: "8 reps", notes: "Keep feet flat, tight arch in back." },
        { name: "Seated Dumbbell Overhead Press", sets: 4, reps: "8-10 reps", notes: "Full range, press over crown of head." },
        { name: "Incline Dumbbell Flyes", sets: 3, reps: "12 reps", notes: "Deep stretch, squeeze at the top." },
        { name: "Tricep Overhead Extension (Cable)", sets: 3, reps: "12 reps", notes: "Keep elbows tucked in." },
        { name: "Dumbbell Lateral Raises", sets: 4, reps: "15 reps", notes: "Last set is a drop set." }
      ]
    },
    tuesday: {
      focus: "Pull (Back, Rear Delts, Biceps)",
      exercises: [
        { name: "Weighted Pull-ups", sets: 4, reps: "6-8 reps", notes: "Use belt or bodyweight to failure." },
        { name: "Barbell Rows", sets: 4, reps: "8 reps", notes: "Overhand grip, pull to belly button." },
        { name: "Dumbbell Hammer Curls", sets: 3, reps: "10-12 reps", notes: "Keeps wrist neutral, builds forearm thickness." },
        { name: "Face Pulls", sets: 3, reps: "15 reps", notes: "Squeeze shoulder blades for 1 sec." },
        { name: "Incline Bicep Curls", sets: 3, reps: "10 reps", notes: "Sit on incline bench, fully stretch biceps." }
      ]
    },
    wednesday: {
      focus: "Legs (Quad Dominant) & Abs",
      exercises: [
        { name: "Barbell Back Squat", sets: 4, reps: "6-8 reps", notes: "Go below parallel, keep chest up." },
        { name: "Leg Press", sets: 3, reps: "10 reps", notes: "High foot placement for quad focus." },
        { name: "Bulgarian Split Squats", sets: 3, reps: "10 per leg", notes: "Hold dumbbells, target teardrop quads." },
        { name: "Cable Crunches", sets: 4, reps: "15 reps", notes: "Kneeling cable crunch, focus on abs flexing." }
      ]
    },
    thursday: {
      focus: "Active Recovery & Treadmill LISS",
      exercises: [
        { name: "Low Intensity Steady State Walk", sets: 1, reps: "35 mins", notes: "Incline: 8.0, Speed: 3.2 mph" },
        { name: "Dynamic Warmup Flow", sets: 1, reps: "15 mins", notes: "Prepare joints for posterior day." }
      ]
    },
    friday: {
      focus: "Legs (Hamstrings & Posterior Glutes)",
      exercises: [
        { name: "Barbell Romanian Deadlift", sets: 4, reps: "8-10 reps", notes: "Keep bar close, hinge hips." },
        { name: "Lying Leg Curls", sets: 3, reps: "10 reps", notes: "Use slow negative tempo (3s down)." },
        { name: "Hip Thrusts (Barbell)", sets: 4, reps: "10 reps", notes: "Drive through heels, squeeze glutes." },
        { name: "Standing Calf Raises", sets: 4, reps: "15 reps", notes: "Hold top contraction for 2 sec." }
      ]
    },
    saturday: {
      focus: "Upper Body Hypertrophy (Pump)",
      exercises: [
        { name: "Incline Dumbbell Bench Press", sets: 4, reps: "10 reps", notes: "Focus upper chest squeeze." },
        { name: "Lat Pulldowns (Wide)", sets: 4, reps: "10 reps", notes: "Slow negative, pull to upper collarbone." },
        { name: "Cable Lateral Raises", sets: 3, reps: "12-15 reps", notes: "Constant tension from side." },
        { name: "Cable Bicep/Tricep Superset", sets: 3, reps: "12 reps each", notes: "Curl & pushdown back-to-back." }
      ]
    },
    sunday: {
      focus: "Rest & Active Recovery Walk",
      exercises: [
        { name: "Outdoor Walk", sets: 1, reps: "30-45 mins", notes: "Relax and recover." }
      ]
    }
  },
  "gym-advanced": {
    monday: {
      focus: "Chest & Back Power (Antagonist)",
      exercises: [
        { name: "Flat Barbell Bench Press", sets: 5, reps: "5 reps", notes: "Powerlifting tempo, heavy compound load." },
        { name: "Weighted Pull-ups (Heavy)", sets: 5, reps: "5 reps", notes: "Increase weight weekly." },
        { name: "Incline Dumbbell Press", sets: 4, reps: "8-10 reps", notes: "Focus on mind-muscle connection." },
        { name: "Barbell Rows (Heavy)", sets: 4, reps: "6-8 reps", notes: "Explosive pull, controlled return." },
        { name: "Dumbbell Pullovers", sets: 3, reps: "12 reps", notes: "Stretches chest and lats concurrently." }
      ]
    },
    tuesday: {
      focus: "Legs Posterior (Deadlift Focus)",
      exercises: [
        { name: "Conventional Barbell Deadlift", sets: 5, reps: "5 reps", notes: "Strict form, double overhand or mixed grip." },
        { name: "Glute-Ham Raise (GHR)", sets: 4, reps: "8 reps", notes: "Slow negative, use glutes & hamstrings." },
        { name: "Barbell Hip Thrusts", sets: 4, reps: "8-10 reps", notes: "Peak pause contraction at the top." },
        { name: "Seated Calf Raises", sets: 4, reps: "15 reps", notes: "Slow stretch and hard squeeze." }
      ]
    },
    wednesday: {
      focus: "Shoulders & Arms Hypertrophy",
      exercises: [
        { name: "Standing Barbell Overhead Press", sets: 4, reps: "6-8 reps", notes: "Clean and press, lock out overhead." },
        { name: "Dumbbell Lateral Raises", sets: 4, reps: "12-15 reps", notes: "Include double drop set on final set." },
        { name: "Weighted Dips", sets: 4, reps: "8 reps", notes: "Lean forward to target chest & triceps." },
        { name: "Incline Dumbbell Bicep Curls", sets: 4, reps: "10 reps", notes: "Supinated palms, maximum bicep stretch." },
        { name: "Cable Overhead Skull Crushers", sets: 3, reps: "12 reps", notes: "Isolates the long head of triceps." }
      ]
    },
    thursday: {
      focus: "Active Recovery Cardio & Core",
      exercises: [
        { name: "Stairmaster Intervals", sets: 1, reps: "25 mins", notes: "Alternate 1 min fast / 1 min slow." },
        { name: "Hanging Leg Toes-to-Bar", sets: 4, reps: "12 reps", notes: "Strict form, no swinging." },
        { name: "Ab Wheel Rollouts", sets: 3, reps: "10 reps", notes: "Fully extend, brace core tightly." }
      ]
    },
    friday: {
      focus: "Legs Anterior (Squat Focus)",
      exercises: [
        { name: "Barbell Back Squat (Heavy)", sets: 5, reps: "5 reps", notes: "High intensity squats, deep range." },
        { name: "Hack Squats (Machine)", sets: 4, reps: "8-10 reps", notes: "Ass-to-grass depth." },
        { name: "Walking Lunges (Heavy Dumbbell)", sets: 3, reps: "12 per leg", notes: "Builds absolute single leg power." },
        { name: "Leg Extensions (Sissy Squat variation)", sets: 3, reps: "15 reps", notes: "Burnout quads to failure." }
      ]
    },
    saturday: {
      focus: "Upper Body Hypertrophy (Volume)",
      exercises: [
        { name: "Dumbbell Incline Bench Press", sets: 4, reps: "10-12 reps", notes: "Stretch upper chest fibers." },
        { name: "T-Bar Chest-Supported Rows", sets: 4, reps: "10 reps", notes: "Squeeze mid-back and rhomboids." },
        { name: "Dumbbell Hammer Curls", sets: 3, reps: "10 reps", notes: "Heavy dumbbells, neutral wrists." },
        { name: "Cable Rope Pushdowns", sets: 3, reps: "12 reps", notes: "Squeeze triceps at bottom." },
        { name: "Seated Lateral Raises (Machine)", sets: 4, reps: "15 reps", notes: "Strict mechanical form." }
      ]
    },
    sunday: {
      focus: "Full Recovery & Mobility Care",
      exercises: [
        { name: "Contrast Therapy (Sauna/Ice)", sets: 3, reps: "N/A", notes: "Promotes nervous system recovery." },
        { name: "Deep Yoga Stretch Flow", sets: 1, reps: "30 mins", notes: "Focus on hamstrings, lower back, and shoulders." }
      ]
    }
  }
};
