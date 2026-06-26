import type { SavedWorkout } from "@/types";

export const APP_WORKOUTS: SavedWorkout[] = [
  {
    id: "app-full-body-kickstart",
    name: "Full Body Kickstart",
    savedAt: "",
    config: {
      experience: "beginner",
      muscles: ["chest", "back", "legs", "core"],
      equipment: ["bodyweight"],
      style: "circuit",
      duration: 15,
      warmupCount: 3,
      exerciseCount: 4,
      cooldownCount: 2,
    },
    workout: {
      name: "Full Body Kickstart",
      estMinutes: 15,
      warmup: [
        "Arm circles — 30 sec forward then backward",
        "Hip circles — 10 reps each direction",
        "Jumping jacks — 1 min at easy pace",
      ],
      exercises: [
        {
          name: "Bodyweight Squat",
          setsReps: "3 × 12",
          howTo: "Feet shoulder-width, toes slightly out. Lower until thighs are parallel, keep chest up.",
        },
        {
          name: "Push-Up",
          setsReps: "3 × 10",
          howTo: "Hands shoulder-width, elbows at 45°. Lower chest to floor, press back up. Drop to knees if needed.",
        },
        {
          name: "Mountain Climber",
          setsReps: "3 × 20 reps (10 each leg)",
          howTo: "Plank position, drive each knee toward chest in alternating fashion. Keep hips level.",
        },
        {
          name: "Plank Hold",
          setsReps: "3 × 30 sec",
          howTo: "Forearms on floor, body in a straight line from head to heels. Squeeze glutes and core.",
          durationSec: 30,
        },
      ],
      cooldown: [
        "Standing quad stretch — hold each leg 30 sec",
        "Child's pose — hold 1 min, breathe deeply",
      ],
    },
  },

  {
    id: "app-upper-body-strength",
    name: "Upper Body Strength",
    savedAt: "",
    config: {
      experience: "beginner",
      muscles: ["chest", "back", "shoulders", "biceps", "triceps"],
      equipment: ["dumbbells"],
      style: "traditional",
      duration: 30,
      warmupCount: 4,
      exerciseCount: 5,
      cooldownCount: 3,
    },
    workout: {
      name: "Upper Body Strength",
      estMinutes: 30,
      warmup: [
        "Shoulder rolls — 10 forward, 10 backward",
        "Arm swings — 20 reps across body",
        "Light dumbbell curl — 10 reps with lightest weight",
        "Band or towel pull-apart — 15 reps",
      ],
      exercises: [
        {
          name: "Dumbbell Bench Press",
          setsReps: "3 × 10",
          howTo: "Lie on a flat surface, feet on floor. Press dumbbells up until arms are extended, lower with control.",
        },
        {
          name: "Single-Arm Dumbbell Row",
          setsReps: "3 × 10 each arm",
          howTo: "Brace on bench or knee. Row dumbbell to hip, elbow close to body. Keep back flat.",
        },
        {
          name: "Dumbbell Shoulder Press",
          setsReps: "3 × 10",
          howTo: "Seated or standing, press dumbbells overhead until arms are extended. Lower to ear level.",
        },
        {
          name: "Bicep Curl",
          setsReps: "3 × 12",
          howTo: "Palms forward, curl dumbbells to shoulders. Keep elbows pinned at sides. Lower slowly.",
        },
        {
          name: "Overhead Tricep Extension",
          setsReps: "3 × 12",
          howTo: "Hold one dumbbell overhead with both hands. Lower behind head, extend back up. Keep elbows close.",
        },
      ],
      cooldown: [
        "Chest doorframe stretch — hold 30 sec",
        "Tricep cross-body stretch — 30 sec each arm",
        "Lat side stretch — lean arm overhead, 30 sec each side",
      ],
    },
  },

  {
    id: "app-hiit-cardio-blast",
    name: "HIIT Cardio Blast",
    savedAt: "",
    config: {
      experience: "beginner",
      muscles: ["legs", "core", "cardio"],
      equipment: ["bodyweight"],
      style: "hiit",
      duration: 20,
      warmupCount: 3,
      exerciseCount: 4,
      cooldownCount: 3,
    },
    workout: {
      name: "HIIT Cardio Blast",
      estMinutes: 20,
      warmup: [
        "March in place — 1 min, swinging arms",
        "Hip opener — 30 sec each side, knee circles",
        "Dynamic lunge — 10 alternating reps",
      ],
      exercises: [
        {
          name: "Burpee",
          setsReps: "4 × 10 (30 sec rest)",
          howTo: "Drop to plank, perform a push-up, jump feet to hands, explode up with a jump and clap overhead.",
        },
        {
          name: "High Knees",
          setsReps: "4 × 30 sec (15 sec rest)",
          howTo: "Run in place, driving each knee to hip height. Pump arms, stay on balls of feet.",
          durationSec: 30,
        },
        {
          name: "Jump Squat",
          setsReps: "4 × 12 (30 sec rest)",
          howTo: "Lower into a squat then explode upward. Land softly with knees bent to absorb impact.",
        },
        {
          name: "Speed Skater",
          setsReps: "4 × 20 (20 sec rest, 10 each side)",
          howTo: "Leap sideways landing on one foot, swing opposite leg behind. Mimic a skating stride.",
        },
      ],
      cooldown: [
        "Walk in place — 1 min to bring heart rate down",
        "Standing hip flexor stretch — 30 sec each leg, lunge position",
        "Standing forward fold — hold 1 min, bend knees if needed",
      ],
    },
  },

  {
    id: "app-core-sculptor",
    name: "Core Sculptor",
    savedAt: "",
    config: {
      experience: "beginner",
      muscles: ["core"],
      equipment: ["bodyweight"],
      style: "traditional",
      duration: 20,
      warmupCount: 3,
      exerciseCount: 5,
      cooldownCount: 3,
    },
    workout: {
      name: "Core Sculptor",
      estMinutes: 20,
      warmup: [
        "Cat-cow stretch — 10 slow reps, breathing with movement",
        "Hip bridge — 10 reps, pause 1 sec at top",
        "Dead bug — 6 reps each side, opposite arm and leg",
      ],
      exercises: [
        {
          name: "Plank",
          setsReps: "3 × 45 sec",
          howTo: "Forearms on floor, neutral spine. Squeeze every muscle. Don't let hips sag or rise.",
          durationSec: 45,
        },
        {
          name: "Bicycle Crunch",
          setsReps: "3 × 20 (10 each side)",
          howTo: "Hands behind head, rotate elbow toward opposite knee while extending the other leg. Slow and controlled.",
        },
        {
          name: "Hollow Body Hold",
          setsReps: "3 × 20 sec",
          howTo: "Lie flat, press lower back into floor. Raise legs and shoulders slightly. Hold the tension.",
          durationSec: 20,
        },
        {
          name: "Russian Twist",
          setsReps: "3 × 20 (10 each side)",
          howTo: "Lean back 45°, feet elevated or on floor. Rotate torso side to side. Add weight for more challenge.",
        },
        {
          name: "Superman Hold",
          setsReps: "3 × 10 reps (3 sec hold each)",
          howTo: "Lie face down, simultaneously lift arms, chest, and legs off floor. Squeeze glutes. Hold 3 sec.",
          durationSec: 3,
        },
      ],
      cooldown: [
        "Child's pose — 1 min, arms extended forward",
        "Supine spinal twist — 30 sec each side, breathe into the rotation",
        "Cobra stretch — 30 sec, gentle lower-back extension",
      ],
    },
  },

  {
    id: "app-lower-body-burn",
    name: "Lower Body Burn",
    savedAt: "",
    config: {
      experience: "beginner",
      muscles: ["legs"],
      equipment: ["bodyweight"],
      style: "traditional",
      duration: 30,
      warmupCount: 4,
      exerciseCount: 5,
      cooldownCount: 3,
    },
    workout: {
      name: "Lower Body Burn",
      estMinutes: 30,
      warmup: [
        "Leg swings — 20 reps front-to-back each leg",
        "Hip circles — 10 reps each direction",
        "Bodyweight squat — 10 slow reps",
        "Walking lunge — 10 alternating steps",
      ],
      exercises: [
        {
          name: "Bulgarian Split Squat",
          setsReps: "3 × 10 each leg",
          howTo: "Rear foot on bench or chair, lower front knee toward floor. Keep torso upright. Full depth.",
        },
        {
          name: "Romanian Deadlift",
          setsReps: "3 × 12",
          howTo: "Hinge at hips with soft knees, push hips back until you feel a hamstring stretch. Drive hips forward to stand.",
        },
        {
          name: "Lateral Lunge",
          setsReps: "3 × 10 each side",
          howTo: "Step wide to one side, sit into that hip, keep other leg straight. Push off to return. Great for adductors.",
        },
        {
          name: "Glute Bridge",
          setsReps: "3 × 15",
          howTo: "Lie on back, knees bent. Drive hips up squeezing glutes hard at the top. Pause 1 sec, lower slowly.",
        },
        {
          name: "Calf Raise",
          setsReps: "3 × 20",
          howTo: "Stand tall, rise onto balls of feet as high as possible, lower slowly. Use a wall for balance if needed.",
        },
      ],
      cooldown: [
        "Pigeon pose — 1 min each side, breathe into the hip",
        "Standing hamstring stretch — 30 sec each leg, foot on chair",
        "Figure-four stretch — 30 sec each side, lying on back",
      ],
    },
  },
];
