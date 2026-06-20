document.addEventListener('DOMContentLoaded', () => {
    const breathingCircle = document.querySelector('.breathing-circle');
    const breathingText = document.querySelector('.breathing-text');
    const breathingSteps = document.querySelectorAll('.breathing-step');
    const breathingStepsContainer = document.querySelector('.breathing-steps');
    
    if (!breathingCircle || !breathingText) {
        console.error('SOS breathing elements not found in DOM');
        return;
    }

    // Inject Stop Button
    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stop';
    stopBtn.style.display = 'none';
    stopBtn.style.marginTop = '20px';
    stopBtn.style.padding = '10px 30px';
    stopBtn.style.border = 'none';
    stopBtn.style.borderRadius = '8px';
    stopBtn.style.background = '#ff7675';
    stopBtn.style.color = '#fff';
    stopBtn.style.fontSize = '1.1rem';
    stopBtn.style.fontWeight = 'bold';
    stopBtn.style.cursor = 'pointer';
    stopBtn.style.transition = 'background 0.3s, transform 0.2s';
    stopBtn.addEventListener('mouseenter', () => {
        stopBtn.style.background = '#d63031';
        stopBtn.style.transform = 'scale(1.05)';
    });
    stopBtn.addEventListener('mouseleave', () => {
        stopBtn.style.background = '#ff7675';
        stopBtn.style.transform = 'scale(1)';
    });
    stopBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stopBreathing();
    });
    
    // Insert stop button after breathingText
    breathingText.parentNode.insertBefore(stopBtn, breathingText.nextSibling);

    // Inject Rounds Counter
    const roundsCounter = document.createElement('p');
    roundsCounter.textContent = 'Rounds completed: 0';
    roundsCounter.style.marginTop = '25px';
    roundsCounter.style.fontSize = '1.2rem';
    roundsCounter.style.color = '#a29bfe';
    roundsCounter.style.fontWeight = '500';
    
    // Insert rounds counter after breathingStepsContainer
    if (breathingStepsContainer) {
        breathingStepsContainer.parentNode.insertBefore(roundsCounter, breathingStepsContainer.nextSibling);
    }

    let isBreathing = false;
    let currentStep = 0;
    let timer;
    let intervalTimer;
    let rounds = 0;
    
    const breathingPhases = [
        { text: 'Inhale...', duration: 4000, icon: 'fa-lungs' },
        { text: 'Hold...', duration: 4000, icon: 'fa-pause' },
        { text: 'Exhale...', duration: 4000, icon: 'fa-wind' }
    ];
    
    function startBreathing() {
        if (isBreathing) return;
        isBreathing = true;
        currentStep = 0;
        rounds = 0;
        roundsCounter.textContent = `Rounds completed: ${rounds}`;
        stopBtn.style.display = 'inline-block';
        breathingCircle.setAttribute('aria-label', 'Breathing exercise active — click to stop');
        updateBreathingStep();
    }
    
    function stopBreathing() {
        isBreathing = false;
        clearTimeout(timer);
        clearInterval(intervalTimer);
        breathingText.textContent = 'Click to Start';
        breathingCircle.style.transform = 'scale(1)';
        stopBtn.style.display = 'none';
        breathingCircle.setAttribute('aria-label', 'Start breathing exercise');
        resetSteps();
    }
    
    function updateBreathingStep() {
        if (!isBreathing) return;
        
        const phase = breathingPhases[currentStep];
        let remainingSeconds = phase.duration / 1000;
        
        breathingText.textContent = `${phase.text} ${remainingSeconds}s`;
        
        clearInterval(intervalTimer);
        intervalTimer = setInterval(() => {
            remainingSeconds--;
            if (remainingSeconds > 0) {
                breathingText.textContent = `${phase.text} ${remainingSeconds}s`;
            }
        }, 1000);
        
        // Update active step
        resetSteps();
        if (breathingSteps[currentStep]) {
            breathingSteps[currentStep].style.background = 'rgba(108, 92, 231, 0.3)';
            breathingSteps[currentStep].style.transform = 'translateY(-5px)';
        }
        
        // Animate circle
        if (currentStep === 0) {
            // Inhale
            breathingCircle.style.transform = 'scale(1.2)';
            breathingCircle.style.transition = 'transform 4s ease-in-out';
        } else if (currentStep === 1) {
            // Hold
            breathingCircle.style.transform = 'scale(1.2)';
        } else {
            // Exhale
            breathingCircle.style.transform = 'scale(1)';
            breathingCircle.style.transition = 'transform 4s ease-in-out';
        }
        
        // Move to next step
        timer = setTimeout(() => {
            if (currentStep === breathingPhases.length - 1) {
                rounds++;
                roundsCounter.textContent = `Rounds completed: ${rounds}`;
            }
            currentStep = (currentStep + 1) % breathingPhases.length;
            updateBreathingStep();
        }, phase.duration);
    }
    
    function resetSteps() {
        breathingSteps.forEach(step => {
            step.style.background = 'rgba(255, 255, 255, 0.1)';
            step.style.transform = 'translateY(0)';
        });
    }
    
    // Add click event to start/stop breathing
    breathingCircle.addEventListener('click', () => {
        if (isBreathing) {
            stopBreathing();
        } else {
            startBreathing();
        }
    });
    
    // Keyboard accessibility
    breathingCircle.setAttribute('tabindex', '0');
    breathingCircle.setAttribute('role', 'button');
    breathingCircle.setAttribute('aria-label', 'Start breathing exercise');

    breathingCircle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            isBreathing ? stopBreathing() : startBreathing();
        }
    });
    
    // Add hover effect
    breathingCircle.addEventListener('mouseenter', () => {
        if (!isBreathing) {
            breathingCircle.style.transform = 'scale(1.1)';
        }
    });
    
    breathingCircle.addEventListener('mouseleave', () => {
        if (!isBreathing) {
            breathingCircle.style.transform = 'scale(1)';
        }
    });
    
    // Initialize
    breathingText.textContent = 'Click to Start';
});
