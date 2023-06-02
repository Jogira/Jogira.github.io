import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { styles } from '../styles';
import { ComputersCanvas } from './canvas';

const Hero = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  const play = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setCurrentTime(audioRef.current.currentTime);
    } else {
      const audio = new Audio('./water.mp3');
      audio.currentTime = currentTime;
      audioRef.current = audio;
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="relative w-full h-screen mx-auto">
      <div className={`${styles.paddingX} absolute inset-0 top-[120px] max-w-7xl mx-auto flex flex-row items-start gap-5`}>
        <div className="flex flex-col justify-center items-center mt-5">
          <div onClick={play} className="w-5 h-5 rounded-full bg-[#915eff] z-10" />
          <div className="w-1 sm:h-80 h-40 violet-gradient" />
        </div>
        <div>
          <h1 className={`${styles.heroHeadText} text-white`}>Hi, I'm <span className="text-[#915eff]">Jonathan</span></h1>
          <p className={`${styles.heroSubText} mt-2 text-white-100`}>
            I am a full stack developer with <br className="sm:block hidden" /> experience in various frameworks and languages.
          </p>
        </div>
      </div>
      <ComputersCanvas></ComputersCanvas>
      <div className="absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center">
        <a href="#about">
          {/* <div className="w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2">
            <motion.div
              animate={{
                y: [0, 24, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop'
              }}
              className="w-3 h-3 rounded-full bg-secondary mb-1"
            />
          </div> */}
        </a>
      </div>
    </section>
  );
};

export default Hero;
