"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import styles from "./city.module.css";
import { motion, useScroll, useTransform } from "framer-motion";

interface CityEvent {
    name: string;
    date: string;
    venue: string;
    time: string;
    mapsUrl?: string;
}

interface CityTemplateProps {
    content: {
        groomName?: string;
        brideName?: string;
        weddingDate?: string;
        weddingVenue?: string;
        weddingCity?: string;
        parentsBless?: string;
        parentsNames?: string;
        message?: string;
        photos?: string[];
        hashtag?: string;
        whatsappNumber?: string;
        instagramHandle?: string;
        events?: CityEvent[];
        videoUrl?: string;
    };
}

const DEFAULT_EVENTS: CityEvent[] = [
    { name: "Mehendi", date: "Friday, March 9th 2026", venue: "Rambagh, Jaipur", time: "6pm Onwards", mapsUrl: "https://maps.google.com" },
    { name: "Haldi", date: "Friday, March 10th 2026", venue: "Rambagh, Jaipur", time: "6pm Onwards", mapsUrl: "https://maps.google.com" },
    { name: "Cocktail", date: "Friday, March 10th 2026", venue: "Rambagh, Jaipur", time: "6pm Onwards", mapsUrl: "https://maps.google.com" },
    { name: "Engagement", date: "Friday, March 11th 2026", venue: "Rambagh, Jaipur", time: "6pm Onwards", mapsUrl: "https://maps.google.com" },
    { name: "Shaadi", date: "Friday, March 12th 2026", venue: "Rambagh, Jaipur", time: "6pm Onwards", mapsUrl: "https://maps.google.com" },
    { name: "Reception", date: "Friday, March 17th 2026", venue: "Rambagh, Jaipur", time: "6pm Onwards", mapsUrl: "https://maps.google.com" },
];

const ASSETS = {
    fullBg: "/templates/city/full-bg.png",
    ganesha: "/templates/city/ganesha.png",
    eventCardOval: "/templates/city/event-card-oval.png",
    floralBunch: "/templates/city/floral-bunch.png",
    floralBunch2: "/templates/city/floral-bunch2.png",
    galleryFrame: "/templates/city/gallery-frame.png",
    pinkFloral: "/templates/city/pink-floral.png",
    sageDamask: "/templates/city/sage-damask.png",
    frontCar: "/templates/city/front-car.png",
    blackCar: "/templates/city/black-car.png",
    couple1: "/templates/city/couple-photo1.jpeg",
    couple2: "/templates/city/couple-photo2.jpeg",
    couple3: "/templates/city/couple-photo3.jpeg",
    couple4: "/templates/city/couple-photo4.jpeg",
    couple5: "/templates/city/couple-photo5.jpeg",
    ceremonyBanner: "/templates/city/ceremony-banner.png",
};

// Scattered across full width matching the reference photo pattern.
// Each lantern has a tilt (rotate) for organic feel.
// Labeled A–V — tell me any letter to remove.
const LANTERNS = [
    // ── TOP ROW  (top: -50% → 10%) ──
    { id: "A", left: "4%", top: "-40%", width: "4vw", rotate: "8deg" },
    { id: "B", left: "17%", top: "-45%", width: "3vw", rotate: "-10deg" },
    { id: "C", left: "55%", top: "-42%", width: "5vw", rotate: "5deg" },
    { id: "D", left: "72%", top: "-48%", width: "4vw", rotate: "-8deg" },
    { id: "E", left: "88%", top: "-44%", width: "5vw", rotate: "12deg" },
    { id: "F", left: "93%", top: "-38%", width: "3vw", rotate: "-5deg" },

    // ── UPPER MIDDLE (top: 10% → 60%) ──
    { id: "G", left: "2%", top: "15%", width: "8vw", rotate: "14deg" },
    { id: "H", left: "21%", top: "20%", width: "3vw", rotate: "-9deg" },
    { id: "I", left: "64%", top: "12%", width: "3vw", rotate: "7deg" },
    { id: "J", left: "80%", top: "18%", width: "6vw", rotate: "-12deg" },
    { id: "K", left: "95%", top: "25%", width: "4vw", rotate: "6deg" },

    // ── MIDDLE (top: 60% → 120%) ──
    { id: "L", left: "7%", top: "65%", width: "3vw", rotate: "-7deg" },
    { id: "M", left: "19%", top: "72%", width: "7vw", rotate: "11deg" },
    { id: "N", left: "38%", top: "80%", width: "5vw", rotate: "-6deg" },
    { id: "O", left: "60%", top: "68%", width: "3vw", rotate: "9deg" },
    { id: "P", left: "77%", top: "75%", width: "8vw", rotate: "-13deg" },

    // ── LOWER MIDDLE (top: 120% → 200%) ──
    { id: "Q", left: "3%", top: "140%", width: "9vw", rotate: "10deg" },
    { id: "R", left: "27%", top: "155%", width: "4vw", rotate: "-8deg" },
    { id: "S", left: "71%", top: "148%", width: "3vw", rotate: "7deg" },
    { id: "T", left: "90%", top: "162%", width: "6vw", rotate: "-11deg" },

    // ── BOTTOM ZONE (~280%) ──
    { id: "U", left: "4%", top: "278%", width: "6vw", rotate: "-9deg" },
    { id: "V", left: "84%", top: "282%", width: "8vw", rotate: "8deg" },
    { id: "W", left: "14%", top: "285%", width: "4vw", rotate: "13deg" },
];

export default function CityTemplate({ content }: CityTemplateProps) {
    const groomName = content.groomName || "Abhishek";
    const brideName = content.brideName || "Kanika";
    const parentsBless = content.parentsBless || "With the heavenly blessings of\nSmt. Lata Devi & Sm. Kamal Kapoor";
    const parentsNames = content.parentsNames || "Mrs. Reena & Mr. Rajiv Kapoor";
    const message = content.message || "We are both so delighted that you are able to join us in celebrating what we hope will be one of the happiest days of our lives. The affection shown to us by so many people since our roka has been incredibly moving, and has touched us both deeply.\n\nWe are looking forward to see you at the wedding.";
    const hashtag = content.hashtag || "#abkan";
    const whatsappNumber = content.whatsappNumber || "919999999999";
    const instagramHandle = content.instagramHandle || "weddingmoments";
    const events = content.events && content.events.length > 0 ? content.events : DEFAULT_EVENTS;
    const photos = content.photos && content.photos.length > 0 ? content.photos : [
        ASSETS.couple1, ASSETS.couple2, ASSETS.couple3, ASSETS.couple4, ASSETS.couple5,
    ];

    const weddingDate = useMemo(
        () => content.weddingDate ? new Date(content.weddingDate) : new Date("2026-03-13T18:00:00"),
        [content.weddingDate]
    );

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { scrollY } = useScroll();
    // Names gently drift down 120 px over the first 400 px of scroll
    const heroTranslateY = useTransform(scrollY, [0, 400], [0, 120], { clamp: true });

    useEffect(() => {
        const tick = () => {
            const diff = weddingDate.getTime() - Date.now();
            if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0 }); return; }
            setCountdown({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
            });
        };
        tick();
        const id = setInterval(tick, 60000);
        return () => clearInterval(id);
    }, [weddingDate]);

    useEffect(() => {
        if (!audioRef.current && content.videoUrl) {
            audioRef.current = new Audio(content.videoUrl);
            audioRef.current.loop = true;
        }
    }, [content.videoUrl]);

    const toggleMusic = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play().catch(() => { }); setIsPlaying(true); }
    }, [isPlaying]);

    useEffect(() => {
        const id = setInterval(() => setCurrentPhoto(p => (p + 1) % Math.max(photos.length, 1)), 3000);
        return () => clearInterval(id);
    }, [photos.length]);

    const blessingLines = parentsBless.split('\n');

    return (
        <div className={styles.wrapper}>

            {/* Music Toggle */}
            {content.videoUrl && (
                <button
                    className={`${styles.musicBtn} ${isPlaying ? styles.musicBtnActive : ""}`}
                    onClick={toggleMusic}
                    aria-label="Toggle music"
                >
                    {isPlaying
                        ? <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                        : <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                    }
                </button>
            )}

            {/* ── HERO OVERLAY ──
                Absolutely positioned over the bg image.
                Names use position:sticky to stay in view.
                Lanterns are scattered at the sides (labeled A–S).            */}
            <div className={styles.heroStickyOuter}>
                <motion.div
                    className={styles.heroNamesBlock}
                    style={{ y: heroTranslateY }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    <div className={styles.heroName}>{groomName.toUpperCase()}</div>
                    <div className={styles.wedsText}>W E D S</div>
                    <div className={styles.heroName}>{brideName.toUpperCase()}</div>
                </motion.div>

                {/* Ceremony-banner lanterns — tell me any letter (A–S) to remove */}
                {LANTERNS.map(l => (
                    <img
                        key={l.id}
                        src={ASSETS.ceremonyBanner}
                        alt=""
                        data-id={l.id}
                        className={styles.ceremonyBannerLantern}
                        style={{ position: 'absolute', left: l.left, top: l.top, width: l.width, opacity: 0.8, transform: `rotate(${l.rotate ?? '0deg'})` }}
                    />
                ))}
            </div>

            {/* ── MAIN BACKGROUND SECTION ── */}
            <div className={styles.tallBgContainer}>
                <img src={ASSETS.fullBg} className={styles.fullBgImage} alt="" />

                {/* 2. INVITATION TEXT */}
                <div className={styles.invitationBlock}>
                    <div className={styles.omText}>ॐ श्री गणेशाय नम</div>
                    <img src={ASSETS.ganesha} alt="Ganesha Motif" className={styles.ganeshaIcon} />
                    <p className={styles.blessingText}>
                        {blessingLines.map((line, i) => (
                            <React.Fragment key={i}>
                                {line}{i < blessingLines.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </p>
                    <div className={styles.divider} />
                    <p className={styles.parentsText}>{parentsNames}</p>
                </div>

                {/* 3. INVITE JOIN BLOCK */}
                <div className={styles.inviteJoinBlock}>
                    <h2 className={styles.inviteHeader}>INVITE</h2>
                    <p className={styles.inviteSubHeader}>You to join us in the wedding celebrations of</p>
                    <div className={styles.inviteCouple}>
                        <span className={styles.inviteName}>{groomName}</span>
                        <span className={styles.inviteAmpersand}>&</span>
                        <span className={styles.inviteName}>{brideName}</span>
                    </div>
                    <p className={styles.daughterOf}>Daughter of<br />{parentsNames},</p>
                    <p className={styles.inviteSubHeader}>On the following events</p>
                </div>

                {/* 4. EVENTS GRID */}
                <div className={styles.eventsBlock}>
                    {events.map((ev, i) => (
                        <motion.div
                            key={i}
                            className={styles.eventCard}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                        >
                            <img src={ASSETS.eventCardOval} alt="" className={styles.eventBg} />
                            <img
                                src={i % 2 === 0 ? ASSETS.floralBunch : ASSETS.floralBunch2}
                                alt=""
                                className={i % 2 === 0 ? styles.floralTopLeft : styles.floralBottomRight}
                            />
                            <div className={styles.eventContent}>
                                <h3>{ev.name.toUpperCase()}</h3>
                                <p className={styles.eventDate}>{ev.date}</p>
                                <p className={styles.eventVenue}>{ev.venue}</p>
                                <p className={styles.eventTime}>{ev.time}</p>
                                {ev.mapsUrl && (
                                    <a href={ev.mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.eventMapLink}>
                                        See the route
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 5. SEE THE ROUTE */}
                <div className={styles.seeRouteBlock}>
                    <h2 className={styles.seeRouteTitle}>SEE THE<br />ROUTE</h2>
                    <p className={styles.seeRouteSub}>Click to open the map</p>
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className={styles.mapIconBtn} />
                </div>
            </div>

            {/* 6. TEAL CAR SECTION */}
            <div className={styles.tealCarSection}>
                <div className={styles.tealDamaskFallback} />
                <motion.img
                    src={ASSETS.frontCar}
                    alt="Vintage Car"
                    className={styles.tealCarImg}
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                />
            </div>

            {/* 7. GALLERY */}
            <div className={styles.gallerySection}>
                <img src={ASSETS.pinkFloral} className={styles.pinkFloralBg} alt="" />
                <div className={styles.galleryContent}>
                    <h2 className={styles.meetCoupleTitle}>
                        <span className={styles.meetThe}>meet the</span>
                        <span className={styles.brideGroom}>bride and groom</span>
                    </h2>
                    <div className={styles.carouselContainer}>
                        <div className={styles.carouselFrameWrapper}>
                            {photos.map((photo, i) => (
                                <motion.img
                                    key={i}
                                    src={photo}
                                    alt="Couple"
                                    className={styles.carouselPhoto}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: currentPhoto === i ? 1 : 0 }}
                                    transition={{ duration: 0.8 }}
                                />
                            ))}
                            <img src={ASSETS.galleryFrame} alt="Frame" className={styles.galleryFrameImg} />
                        </div>
                    </div>
                    <p className={styles.loveMessage}>{message}</p>
                </div>
            </div>

            {/* 8. RSVP + THINGS TO KNOW + FOLLOW */}
            <div className={styles.bottomSections}>
                <div className={styles.rsvpSection}>
                    <div className={styles.pinkSageTransition} />
                    <img src={ASSETS.sageDamask} className={styles.sageBg} alt="" />
                    <div className={styles.rsvpContent}>
                        <h2 className={styles.rsvpTitle}>
                            <span className={styles.pleaseText}>Please</span>
                            <span className={styles.rsvpText}>RSVP</span>
                        </h2>
                        <p className={styles.whatsappSub}>Click to message on WhatsApp</p>
                        <a href={`https://wa.me/${whatsappNumber}?text=Hi! RSVP for ${groomName} & ${brideName} wedding.`} target="_blank" rel="noopener noreferrer" className={styles.waButton}>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path d="M11.999 2.003C6.477 2.003 2 6.479 2 12c0 1.778.467 3.438 1.276 4.882L2 22l5.278-1.248A9.96 9.96 0 0 0 12 22c5.522 0 10-4.477 10-10S17.522 2.003 12 2.003zm0 1.994a8.002 8.002 0 0 1 8.006 8.003 8 8 0 0 1-8.006 8A7.98 7.98 0 0 1 6.96 18.6l-.352-.208-3.133.74.781-3.036-.228-.375a7.956 7.956 0 0 1-1.034-3.921 8.002 8.002 0 0 1 8.005-8z" />
                            </svg>
                        </a>
                    </div>
                    <div className={styles.blackCarContainer}>
                        <img src={ASSETS.blackCar} alt="Vintage Car" className={styles.blackCarImg} />
                    </div>
                    <div className={styles.ttkContent}>
                        <h2 className={styles.ttkTitle}>
                            <span className={styles.ttkTop}>THINGS TO</span>
                            <span className={styles.ttkBottom}>KNOW</span>
                        </h2>
                        <p className={styles.ttkIntro}>To help you feel at ease and enjoy every moment of the celebrations, we've gathered a few thoughtful details we'd love for you to know before the big day.</p>
                        <div className={styles.gridInfo}>
                            <div className={styles.infoCard}><div className={styles.iconCircle}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></div><h4>HASHTAG</h4><p>While posting photos on social media please use the hashtag — {hashtag}</p></div>
                            <div className={styles.infoCard}><div className={styles.iconCircle}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg></div><h4>WEATHER</h4><p>Mostly sunny with temperature up to 28°C at the venue</p></div>
                            <div className={styles.infoCard}><div className={styles.iconCircle}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect><path d="M4 8l2-4h12l2 4"></path><circle cx="7" cy="15" r="1"></circle><circle cx="17" cy="15" r="1"></circle></svg></div><h4>STAFF</h4><p>We recommend Bhola Bhawan hotel near the venue for staff</p></div>
                            <div className={styles.infoCard}><div className={styles.iconCircle}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div><h4>PARKING</h4><p>Valet parking for all guests will be available at the venue</p></div>
                        </div>
                    </div>
                    <div className={styles.followContent}>
                        <h2 className={styles.followTitle}>
                            <span className={styles.followWord}>Follow</span>
                            <span className={styles.theWord}>the</span>
                            <span className={styles.actionWord}>action</span>
                        </h2>
                        <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer" className={styles.instaLink}>
                            <span className={styles.instaText}>Click to open our Instagram page</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* 9. COUNTDOWN FOOTER */}
            <div className={styles.countdownSection}>
                <div className={styles.nightSkyFallback} />
                <div className={styles.countdownInner}>
                    <h2 className={styles.countdownTitle}>The countdown begins</h2>
                    <div className={styles.timer}>
                        <span>{String(countdown.days).padStart(2, '0')}D</span>
                        <span>{String(countdown.hours).padStart(2, '0')}H</span>
                        <span>{String(countdown.minutes).padStart(2, '0')}M</span>
                    </div>
                    <p className={styles.countdownMsg}>Our families are excited that you are able to join us in celebrating what we hope will be one of the happiest days of our lives.</p>
                    <p className={styles.copyright}>© Missing Piece {new Date().getFullYear()}</p>
                </div>
            </div>

        </div>
    );
}
