# 🗄️ Database Setup Guide for LiftMeUp

This guide will help you set up Supabase database with all three new features:
1. ✅ Cloud database storage
2. 🔐 Password-protected profiles
3. 🏋️ Custom workout creation

---

## **Step 1: Create a Supabase Account**

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended)
4. Create a new project:
   - **Name**: LiftMeUp
   - **Database Password**: (save this somewhere safe)
   - **Region**: Choose closest to you
   - Click "Create new project"
5. Wait 2-3 minutes for the database to initialize

---

## **Step 2: Run the Database Schema**

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

---

## **Step 3: Get Your API Keys**

1. Go to **Settings** → **API** (left sidebar)
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

---

## **Step 4: Configure Environment Variables**

1. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your keys:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
   ```

3. **Important**: Add `.env` to `.gitignore` if not already there:
   ```bash
   echo ".env" >> .gitignore
   ```

---

## **Step 5: Update Your Code**

I'll provide the updated code files that integrate with Supabase. The main changes are:

### **Files to Update:**
1. `src/utils/supabaseStorage.ts` - New storage layer using Supabase
2. `src/pages/ProfileSelector.tsx` - Add password login
3. `src/pages/CustomWorkoutBuilder.tsx` - New page for creating workouts
4. `src/pages/WorkoutSelection.tsx` - Show custom + preset workouts
5. `src/context/AppContext.tsx` - Use Supabase storage

---

## **Step 6: Deploy to Vercel**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - Click **Environment Variables**
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

---

## **🎉 What You Get**

### **1. Cloud Storage**
- All data stored in Supabase (not localStorage)
- Accessible from any device
- Automatic backups

### **2. Password Protection**
- Each profile has a password
- Can't delete or edit others' profiles
- Can still view others' progress if they set it to public

### **3. Custom Workouts**
- Create unlimited custom workouts
- Add custom exercises with your preferred:
  - Weight ranges
  - Rep ranges
  - Number of sets
- Mix custom and preset workouts

---

## **🔒 Security Features**

- Passwords are hashed with bcrypt (never stored in plain text)
- Row Level Security (RLS) enabled
- Public profiles can be viewed but not edited
- Private profiles are completely hidden from others

---

## **📱 How It Works for Your Friends**

1. **Create Profile**: Choose a name, avatar, and password
2. **Make Public/Private**: Toggle whether others can see your progress
3. **Use Any Device**: Login from phone, tablet, or computer
4. **Create Workouts**: Build custom routines or use presets
5. **View Friends**: See who's lifting the most (if they're public)

---

## **🚀 Next Steps**

After I provide the updated code files, you'll be able to:
- ✅ Create password-protected profiles
- ✅ Login from any device
- ✅ Create custom workouts
- ✅ View friends' progress (if they allow it)
- ✅ Deploy to Vercel and share the link

---

## **💡 Tips**

- **Free Tier**: Supabase free tier includes:
  - 500 MB database
  - 1 GB file storage
  - 2 GB bandwidth
  - (More than enough for 100+ users)

- **Backup**: Supabase automatically backs up your data

- **Scaling**: If you get lots of users, upgrade to Pro ($25/month)

---

Ready to implement? Let me know and I'll provide all the updated code files!
