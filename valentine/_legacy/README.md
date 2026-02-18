# 📝 QUICK START - How to Customize This Website

**For your friend who wants to use this for their girlfriend:**

## 🎯 What You Need to Do

1. **Edit ONE file**: `config.js` 
2. **Replace photos**: Put new photos in a folder
3. **Replace music**: Put a new music file in the Video folder
4. **Deploy**: Run `vercel --prod`

That's it!

---

## ✏️ Edit config.js

Open `config.js` and change these 3 things:

```javascript
const CONFIG = {
    // 1. Change this to her name
    recipientName: "Sarah",
    
    // 2. (Optional) Change your name
    senderName: "Mike",

    // 3. Path to your music file
    backgroundMusic: "./Video/Perfect.mp4",

    // 4. List your photos
    photos: [
        './photos/pic1.jpg',
        './photos/pic2.jpg',
        './photos/pic3.jpg'
    ]
};
```

---

## 📂 Folder Setup

```
valentine/
├── config.js          ← Edit this!
├── Video/
│   └── Perfect.mp4    ← Your music here
└── photos/            ← Create this folder
    ├── pic1.jpg       ← Your photos here
    ├── pic2.jpg
    └── pic3.jpg
```

---

## 🚀 Deploy

```powershell
cd valentine
vercel --prod
```

**Full detailed guide**: See `customization_guide.md`
