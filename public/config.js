// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE to personalise the invite. Everything on the
//  page is generated from these values. Refresh the browser
//  after saving.
// ─────────────────────────────────────────────────────────────
window.WEDDING = {
  invocation: "॥ श्री गणेशाय नमः ॥",

  bride: "Rutuja",
  brideSurname: "Pathak",
  brideParents: "Daughter of Mrs. Shruti & Mr. Sujit Pathak",

  groom: "Himanshu",
  groomSurname: "Kankal",
  groomParents: "Son of Mrs. Madhavi & Mr. Umesh Kankal",

  initials: "HR",                         // shown on the wax seal

  // Line above the names
  hostLine: "With the blessings of our families, we joyfully invite you to celebrate the wedding of",

  // Main wedding moment — drives the hero date, calendar and countdown.
  // Format: YYYY-MM-DDTHH:MM (local time at the venue)
  weddingDate: "2026-12-30T12:00",
  timeLabel: "12:00 PM onwards",

  hashtag: "",                           // e.g. "#HimRuForever" — leave empty to hide
  closing: "See you there!",

  story: {
    quote: "Two hearts, one promise,\nSeven steps, seven vows, one eternal togetherness.",
  },

  // Put image files in public/photos/ and list them here.
  // wide: true for landscape photos. pos: which part of the photo to keep in frame.
  photos: [
    { src: "us-1.jpg", pos: "center 25%" },
    { src: "us-2.jpg", pos: "center 30%" },
    { src: "us-3.jpg", pos: "center 40%", wide: true },
  ],
  photosCaption: "Little moments, a lifetime of memories",

  // icon: haldi | mehendi | music | rings | fire | dinner | garland
  events: [
    { name: "Haldi",                  date: "2026-12-29T15:30", end: "2026-12-29T18:00", icon: "haldi",   theme: "Kesariya Rang Mein Radhe-Shyam" },
    { name: "Sangeet",                date: "2026-12-29T19:00", end: "2026-12-29T22:00", icon: "music",   theme: "Twinkle Twinkle, Let the Sangeet Sparkle" },
    { name: "Vidhi",                  date: "2026-12-30T07:00", end: "2026-12-30T09:00", icon: "fire",    theme: "Nauvari cha Saaj, Dhoticha Thaath" },
    { name: "Mangalashtaka & Varmala", date: "2026-12-30T12:00", end: "2026-12-30T15:00", icon: "garland", theme: "Shubhmangal: The Royal Attire Affair" },
  ],

  venue: {
    name: "Abhishek Banquets",
    description: "Where two families come together as one.",
    address: "Gat No 1420, Near Wageshwar Temple, Wagholi Bhavdi Road, Lohegaon Rd, Wagholi, Pune, Maharashtra 412207",
    // Paste a Google Maps share link, or leave empty to search by name + address
    mapsUrl: "",
  },

  // Background music: drop the song into public/ as music.mp3.
  // If the file is missing, a soft built-in music-box melody plays instead.
  music: { src: "music.mp3?v=2" },     // bump v= after replacing the file
};
