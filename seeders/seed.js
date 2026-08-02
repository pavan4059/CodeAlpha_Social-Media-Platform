const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const seedData = async (shouldExit = true) => {
  try {
    console.log('📦 Clearing existing database collection documents...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    console.log('👥 Generating high-fidelity user accounts & avatars...');
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    const profilesData = [
      {
        username: 'pawan_kalyan',
        email: 'pawan@pulse.io',
        password: defaultPassword,
        fullName: 'Pawan Kalyan',
        bio: 'Full Stack Architect & Visionary Builder. Passionate about real-time scalable web systems, cyber-violet UI designs, and cloud edge computing. 💻🔥',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
      },
      {
        username: 'alex_dev',
        email: 'alex@deepmind.ai',
        password: defaultPassword,
        fullName: 'Alex Chen',
        bio: 'Senior AI Systems Engineer @ Google DeepMind. Obsessed with autonomous multi-agent systems, neural network latency optimization, and cyberpunk aesthetics. ⚡🛰️',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80'
      },
      {
        username: 'elena_design',
        email: 'elena@novastudio.co',
        password: defaultPassword,
        fullName: 'Elena Rostova',
        bio: 'Lead Product & UI/UX Design Lead. Crafting intuitive glassmorphic interfaces and vibrant design systems that breathe life into digital canvases. ✨🎨',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&auto=format&fit=crop&q=80'
      },
      {
        username: 'marcus_photog',
        email: 'marcus@neon-arts.com',
        password: defaultPassword,
        fullName: 'Marcus Vance',
        bio: 'Cyber-Noir conceptual artist & lightscape photographer. Capturing synthetic urban reflections and atmospheric nocturnal skylines. 📷🌃',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80'
      },
      {
        username: 'sophia_ai',
        email: 'sophia@synth.ai',
        password: defaultPassword,
        fullName: 'Dr. Sophia Carter',
        bio: 'AI Safety & Generative Intelligence Researcher. Exploring self-correcting prompt architectures and ethical AI alignment. 🤖💡',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80'
      },
      {
        username: 'dev_oracle',
        email: 'oracle@codereview.org',
        password: defaultPassword,
        fullName: 'The Code Oracle',
        bio: 'Clean code zealot, system architect, and runtime speed enthusiast. Helping engineers ship ultra-fast reactive platforms without bloat. 🛡️⚙️',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80'
      }
    ];

    const users = await User.insertMany(profilesData);
    console.log(`✅ Successfully seeded ${users.length} custom user accounts!`);

    const [pawan, alex, elena, marcus, sophia, oracle] = users;

    console.log('🤝 Establishing interactive follower network...');
    pawan.followers.push(alex._id, elena._id, marcus._id, sophia._id, oracle._id);
    pawan.following.push(alex._id, elena._id, sophia._id);
    
    alex.followers.push(pawan._id, elena._id, sophia._id, oracle._id);
    alex.following.push(pawan._id, elena._id, marcus._id);
    
    elena.followers.push(pawan._id, alex._id, marcus._id);
    elena.following.push(pawan._id, alex._id, marcus._id, sophia._id);

    sophia.followers.push(pawan._id, alex._id, oracle._id);
    sophia.following.push(pawan._id, alex._id);

    marcus.followers.push(elena._id, alex._id);
    marcus.following.push(elena._id, pawan._id);

    oracle.followers.push(alex._id);
    oracle.following.push(pawan._id, alex._id, sophia._id);

    await Promise.all([
      pawan.save(), alex.save(), elena.save(), marcus.save(), sophia.save(), oracle.save()
    ]);

    console.log('📝 Publishing initial engaging posts & media attachments...');
    const postsData = [
      {
        author: pawan._id,
        content: "Just architected the Pulse core engine with a brand new Cyber-Violet dark aesthetic. Zero-latency optimistic UI transitions and pure MongoDB responsiveness. What do you think of this visual direction? ⚡🕶️ #FullStack #Pulse #UIUX",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
        likes: [alex._id, elena._id, sophia._id, marcus._id, oracle._id],
        commentsCount: 2,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
      },
      {
        author: elena._id,
        content: "Why stick to monotone blues when you can wield neon cyan and deep violet? Glassmorphism paired with subtle kinetic hover micro-animations creates an emotional connection with the digital interface. Here is a snippet from our latest visual token study! 💎🎨",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
        likes: [pawan._id, alex._id, marcus._id],
        commentsCount: 2,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
      },
      {
        author: alex._id,
        content: "Testing multi-agent autonomous coding loops. When AI agents communicate directly with local database engines and self-verify their implementations, developmental iteration speed accelerates 10x. The future of developer tooling is already arriving! 🤖🚀 #AI #DeepMind #Eng",
        imageUrl: null,
        likes: [pawan._id, sophia._id, oracle._id],
        commentsCount: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        author: marcus._id,
        content: "Midnight rain in Neo-Tokyo. Captured at 35mm f/1.4. There is something mesmerizing about how synthetic neon reflections bleed into wet asphalt. Enjoy the desktop wallpaper! 🌃🌧️ #CyberNoir #Photography #Light",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80",
        likes: [pawan._id, elena._id, alex._id, sophia._id],
        commentsCount: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5)
      },
      {
        author: sophia._id,
        content: "We just released our benchmark findings on self-correcting neural feedback loops. Remarkable reductions in hallucination rates when models utilize structured validation protocols! Thrilled to present this at next week's global summit. 🧠📊",
        imageUrl: null,
        likes: [alex._id, oracle._id, pawan._id],
        commentsCount: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 45)
      },
      {
        author: oracle._id,
        content: "Reminder for all engineers today: Clean database indexes and minimal API payload overhead transform user perception. Don't rely on frontend loaders when your backend query can finish in under 5 milliseconds. Build clean, execute fast. ⚡🛡️",
        imageUrl: null,
        likes: [pawan._id, alex._id],
        commentsCount: 1,
        createdAt: new Date(Date.now() - 1000 * 60 * 20)
      }
    ];

    const seededPosts = await Post.insertMany(postsData);
    console.log(`✅ Created ${seededPosts.length} timeline posts!`);

    console.log('💬 Injecting conversational threads into posts...');
    const commentsData = [
      {
        post: seededPosts[0]._id,
        author: elena._id,
        text: "The glassmorphism borders against the deep purple backdrop look astonishing! Exceptional work, Pawan! ✨",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5)
      },
      {
        post: seededPosts[0]._id,
        author: alex._id,
        text: "The Mongoose indexing and reactivity is blazingly fast. Incredible architecture!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.2)
      },
      {
        post: seededPosts[1]._id,
        author: marcus._id,
        text: "As a visual artist, I completely agree. Color harmonic saturation makes all the difference in user engagement.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5)
      },
      {
        post: seededPosts[1]._id,
        author: pawan._id,
        text: "Thanks Elena! That neon cyan gradient token is our favorite design upgrade so far.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.1)
      },
      {
        post: seededPosts[2]._id,
        author: sophia._id,
        text: "Fascinating results! Are you seeing linear scaling in multi-agent tool execution times?",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.8)
      },
      {
        post: seededPosts[3]._id,
        author: elena._id,
        text: "Absolutely breathtaking composition, Marcus! The teal highlights are divine.",
        createdAt: new Date(Date.now() - 1000 * 60 * 50)
      },
      {
        post: seededPosts[5]._id,
        author: pawan._id,
        text: "100%! We ensured our Post and Comment timestamp indexes deliver instant query resolution.",
        createdAt: new Date(Date.now() - 1000 * 60 * 10)
      }
    ];

    await Comment.insertMany(commentsData);
    console.log(`✅ Seeded ${commentsData.length} discussion comments!`);
    console.log('🎉 Database seeding completed successfully!');
    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error(`❌ Database Seeding Error: ${error.message}`);
    if (shouldExit) process.exit(1);
  }
};

if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB(false).then(() => seedData(true));
}

module.exports = { seedData };
