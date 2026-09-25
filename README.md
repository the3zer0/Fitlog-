# FitLog

FitLog is a dark-themed workout library and training planner built with Next.js. It lets users browse workouts, add exercises to today's plan, save workouts for later, and track completed exercises.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- LocalStorage

## Features

- Responsive workout library with API-based workout data
- Workout detail pages with exercise information and instructions
- Today's Plan with a maximum of five workouts
- Saved workouts with live counters
- Sort workouts by duration, calories, or rating
- Mark workouts as completed and track completed exercises
- Remove workouts from Today's Plan
- Live plan metrics for exercises, minutes, and calories
- Toast notifications for workout actions
- Custom 404 page and loading states
- LocalStorage persistence for plan and saved workouts

## API

FitLog uses the provided workout API:

`https://api.abcz.workers.dev/api/fitlog`

Workout details are loaded using:

`https://api.abcz.workers.dev/api/fitlog/:id`

## Getting Started

Install the dependencies:

```bash
npm install