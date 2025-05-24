
document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadModal = document.getElementById('upload-modal');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const cancelUploadBtn = document.getElementById('cancel-upload-btn');
    const playlist = document.getElementById('playlist');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeHighIcon = document.getElementById('volume-high-icon');
    const volumeLowIcon = document.getElementById('volume-low-icon');
    const volumeMuteIcon = document.getElementById('volume-mute-icon');
    const timelineSlider = document.getElementById('timeline-slider');
    const timelineProgress = document.getElementById('timeline-progress');
    const timelineHandle = document.getElementById('timeline-handle');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeProgress = document.getElementById('volume-progress');
    const volumeHandle = document.getElementById('volume-handle');
    const currentTimeElement = document.getElementById('current-time');
    const totalTimeElement = document.getElementById('total-time');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const currentSongTitle = document.querySelector('.current-song-title');
    const currentSongArtist = document.querySelector('.current-song-artist');
    const dropArea = document.getElementById('drop-area');



    // Audio Logic --------------------------------------------------------------------------------

    //    audio (HTML5 Audio) 
    //    │
    //    ▼
    //    createMediaElementSource(audio)
    //    │
    //    ▼
    //    [EQ it self: filters[0] → filters[1] → ... → filters[N]]
    //    │
    //    ▼
    //    audioCtx.destination ( user's output (speakers, headphones, etc.) )

    //---------------------------------------------------------------------------------------------

    // Audio
    const audio = new Audio();
    let audioSourceNode = null;

    let tracks = [];
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isShuffled = false;
    let repeatMode = 'none'; // 'none', 'all', 'one'
    let isDraggingTimeline = false; // default value
    let isDraggingVolume = false; // default value

    // Upload modal
    uploadBtn.addEventListener('click', () => uploadModal.classList.add('active'));
    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
        uploadModal.classList.remove('active');
    });
    cancelUploadBtn.addEventListener('click', () => uploadModal.classList.remove('active'));
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) uploadModal.classList.remove('active');
    });

    // File upload
    fileInput.addEventListener('change', handleFileUpload);

    // Playback controls ------------------------------------------------------------------------------------------------------------------------------------
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevTrack);
    nextBtn.addEventListener('click', playNextTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    volumeBtn.addEventListener('click', toggleMute);

    // Timeline dragging ------------------------------------------------------------------------------------------------------------------------------------
    timelineSlider.addEventListener('mousedown', (e) => {
        isDraggingTimeline = true;
        document.body.classList.add('dragging');
        updateTimelinePosition(e);
        document.addEventListener('mousemove', updateTimelinePosition);
        document.addEventListener('mouseup', () => {
            isDraggingTimeline = false;
            document.body.classList.remove('dragging');
            document.removeEventListener('mousemove', updateTimelinePosition);
        }, { once: true });
    });

    // Volume dragging ------------------------------------------------------------------------------------------------------------------------------------
    volumeSlider.addEventListener('mousedown', (e) => {
        isDraggingVolume = true;
        document.body.classList.add('dragging');
        updateVolumePosition(e);
        document.addEventListener('mousemove', updateVolumePosition);
        document.addEventListener('mouseup', () => {
            isDraggingVolume = false;
            document.body.classList.remove('dragging');
            document.removeEventListener('mousemove', updateVolumePosition);
        }, { once: true });
    });

    // Audio events
    audio.addEventListener('timeupdate', updateTimelineProgress);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('loadedmetadata', () => {
        totalTimeElement.textContent = formatTime(audio.duration);
    });

    // Handle file upload ------------------------------------------------------------------------------------------------------------------------------------
    function handleFileUpload(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        if (tracks.length === 0) playlist.innerHTML = '';

        files.forEach(file => {
            if (!file.type.startsWith('audio/')) return;
            const track = {
                file: file,
                name: file.name.replace(/\.[^/.]+$/, ''),
                url: URL.createObjectURL(file)
            };
            tracks.push(track);
            const item = createPlaylistItem(track, tracks.length - 1);
            playlist.appendChild(item);
        });

        if (tracks.length > 0 && currentTrackIndex === 0) {
            loadTrack(0);
        }
    }

    function createPlaylistItem(track, index) {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.dataset.index = index;

        const img = document.createElement('div');
        img.className = 'playlist-item-img';
        img.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';

        const details = document.createElement('div');
        details.className = 'playlist-item-details';

        const title = document.createElement('div');
        title.className = 'playlist-item-title';
        title.textContent = track.name;

        const artist = document.createElement('div');
        artist.className = 'playlist-item-artist';
        artist.textContent = 'Неизвестный исполнитель';

        details.appendChild(title);
        details.appendChild(artist);
        item.appendChild(img);
        item.appendChild(details);

        item.addEventListener('click', () => {
            loadTrack(index);
            togglePlay(true);
        });

        return item;
    }

    // Load track by index
    function loadTrack(index) {
        if (index < 0 || index >= tracks.length) return;
        currentTrackIndex = index;
        const track = tracks[index];
        audio.src = track.url;
        audio.load();

        // refresh current song title and artist
        if (currentSongTitle) currentSongTitle.textContent = track.name;
        if (currentSongArtist) currentSongArtist.textContent = 'Неизвестный исполнитель';

        // highlight current track in playlist
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.classList.toggle('active', Number(item.dataset.index) === index);
        });
    }

    function togglePlay() {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (audio.paused) {
            audio.play();
            isPlaying = true;
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            audio.pause();
            isPlaying = false;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    function playPrevTrack() {
        if (tracks.length === 0) return;
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        const newIndex = isShuffled
            ? Math.floor(Math.random() * tracks.length)
            : (currentTrackIndex - 1 + tracks.length) % tracks.length;

        loadTrack(newIndex);
        togglePlay(true);
    }

    function playNextTrack() {
        if (tracks.length === 0) return;

        const newIndex = isShuffled
            ? Math.floor(Math.random() * tracks.length)
            : (currentTrackIndex + 1) % tracks.length;

        loadTrack(newIndex);
        togglePlay(true);
    }

    function handleTrackEnd() {
        if (repeatMode === 'one') {
            audio.currentTime = 0;
            audio.play();
        } else if (repeatMode === 'all' || tracks.length > 1) {
            playNextTrack();
        } else {
            audio.currentTime = 0;
            isPlaying = false;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    function toggleShuffle() {
        isShuffled = !isShuffled;
        shuffleBtn.classList.toggle('active', isShuffled);
    }

    function toggleRepeat() {
        if (repeatMode === 'none') {
            repeatMode = 'all';
            repeatBtn.classList.add('active');
        } else if (repeatMode === 'all') {
            repeatMode = 'one';
        } else {
            repeatMode = 'none';
            repeatBtn.classList.remove('active');
        }
    }

    function toggleMute() {
        audio.volume = audio.volume === 0 ? 0.7 : 0;
        updateVolumeUI();
    }

    function updateTimelineProgress() {
        if (isNaN(audio.duration)) return;
        const percent = audio.currentTime / audio.duration;
        timelineProgress.style.width = `${percent * 100}%`;
        timelineHandle.style.left = `${percent * 100}%`;
        currentTimeElement.textContent = formatTime(audio.currentTime);
    }

    function updateVolumePosition(e) {
        const rect = volumeSlider.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.volume = percent;
        updateVolumeUI();
    }

    function updateVolumeUI() {
        const percent = audio.volume * 100;
        volumeProgress.style.width = `${percent}%`;
        volumeHandle.style.left = `${percent}%`;
        volumeHighIcon.style.display = audio.volume >= 0.5 ? 'block' : 'none';
        volumeLowIcon.style.display = audio.volume > 0 && audio.volume < 0.5 ? 'block' : 'none';
        volumeMuteIcon.style.display = audio.volume === 0 ? 'block' : 'none';
    }

    function updateTimelinePosition(e) {
        const rect = timelineSlider.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (!isNaN(audio.duration)) audio.currentTime = percent * audio.duration;
        updateTimelineProgress();
    }

    function formatTime(seconds) {
        seconds = Math.floor(seconds);
        const minutes = Math.floor(seconds / 60);
        return `${minutes}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`;
    }

    // Drag & Drop (Full-screen drop zone) ------------------------------------------------------------------------------------------------------------------------------------
    let dragCounter = 0;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        window.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    window.addEventListener('dragenter', () => {
        dragCounter++;
        dropArea.classList.add('highlight');
    });

    window.addEventListener('dragleave', () => {
        dragCounter--;
        if (dragCounter === 0) dropArea.classList.remove('highlight');
    });

    window.addEventListener('drop', (e) => {
        dragCounter = 0;
        dropArea.classList.remove('highlight');

        const files = Array.from(e.dataTransfer.files);
        const audioFiles = files.filter(file => file.type.startsWith('audio/'));
        if (audioFiles.length > 0) {
            handleFileUpload({ target: { files: audioFiles } });
        }
    });

    // Init volume
    audio.volume = 1; // Default volume in player 
    updateVolumeUI();

    // Server tracks upload ------------------------------------------------------------------------------------------------------------------------------------
    fetch('/tracks')
        .then(res => res.json())
        .then(serverTracks => {
            if (serverTracks.length > 0) playlist.innerHTML = '';
            serverTracks.forEach((filename, i) => {
                const track = {
                    name: filename.replace(/\.[^/.]+$/, ''),
                    url: `/uploads/${filename}`
                };
                tracks.push(track);
                const item = createPlaylistItem(track, tracks.length - 1);
                playlist.appendChild(item);
            });

            if (tracks.length > 0) {
                loadTrack(0);
            }
        })
        .catch(err => console.error('error fetching tracks from server:', err));

    // Handle file upload (sending tracks to server)
    function handleFileUpload(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => {
            if (file.type.startsWith('audio/')) {
                formData.append('tracks', file);
            }
        });

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) throw new Error('error uploading tracks');
            return res.json();
        })
        .then(() => {
            // after successful upload, fetch the updated track list from the server
            return fetch('/tracks');
        })
        .then(res => res.json())
        .then(serverTracks => {
            playlist.innerHTML = '';
            tracks.length = 0;
            serverTracks.forEach((filename, i) => {
                const track = {
                    name: filename.replace(/\.[^/.]+$/, ''),
                    url: `/uploads/${filename}`
                };
                tracks.push(track);
                const item = createPlaylistItem(track, tracks.length - 1);
                playlist.appendChild(item);
            });
            if (tracks.length > 0) {
                loadTrack(0);
            }
        })
        .catch(err => {
            console.error('error:', err);
            alert('track upload failed: ' + err.message);
        });
    }

    // EQ Modal logic-------------------------------------------------------------------------------------------------------------------------------------
    const eqBtn = document.getElementById('eq-btn');
    const eqModal = document.getElementById('eq-modal');
    const closeEqBtn = document.getElementById('close-eq-btn');
    const resetEqBtn = document.getElementById('reset-eq-btn');
    const eqCanvas = document.getElementById('eqCanvas');

    eqBtn.addEventListener('click', () => eqModal.classList.add('active'));
    closeEqBtn.addEventListener('click', () => eqModal.classList.remove('active'));
    eqModal.addEventListener('click', (e) => {
        if (e.target === eqModal) eqModal.classList.remove('active');
    });
    resetEqBtn.addEventListener('click', resetEQ);

    // EQ implementation----------------------------------------------------------------------------------------------------------------------------------
    const NUM_BANDS = 6;
    const MAX_GAIN = 24;
    const MIN_GAIN = -24;
    const MIN_FREQ = 20;
    const MAX_FREQ = 20000;
    const ctx = eqCanvas.getContext('2d');

    function resizeCanvas() {
        eqCanvas.width = eqCanvas.clientWidth;
        eqCanvas.height = eqCanvas.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);

    // EQ connection 
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const filters = [];
    const bands = [];

    for (let i = 0; i < NUM_BANDS; i++) {
        const type = (i === 0) ? 'lowshelf' : (i === NUM_BANDS - 1) ? 'highshelf' : 'peaking';
        const biquad = audioCtx.createBiquadFilter();
        biquad.type = type;
        biquad.frequency.value = 100 * Math.pow(2, i);
        biquad.gain.value = 0; 
        biquad.Q.value = 1; // width of the filter 
        filters.push(biquad);
        bands.push({ type, freq: biquad.frequency.value, gain: biquad.gain.value, Q: biquad.Q.value });
    }
    filters.reduce((a, b) => (a.connect(b), b)).connect(audioCtx.destination);

    // Connect HTML5 audio to EQ 
    if (!audioSourceNode) {
        audioSourceNode = audioCtx.createMediaElementSource(audio);
        audioSourceNode.connect(filters[0]);
    }

    function logScale(x) {
        const ratio = x / eqCanvas.width;
        return MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, ratio);
    }
    function invLogScale(freq) {
        const logMin = Math.log10(MIN_FREQ);
        const logMax = Math.log10(MAX_FREQ);
        const logFreq = Math.log10(freq);
        return ((logFreq - logMin) / (logMax - logMin)) * eqCanvas.width;
    }
    function gainToY(gain) {
        return eqCanvas.height / 2 - (gain / MAX_GAIN) * (eqCanvas.height / 2);
    }
    function yToGain(y) {
        return ((eqCanvas.height / 2 - y) / (eqCanvas.height / 2)) * MAX_GAIN;
    }
    function drawGrid() {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let db = MIN_GAIN; db <= MAX_GAIN; db += 6) {
            const y = gainToY(db);
            ctx.moveTo(0, y);
            ctx.lineTo(eqCanvas.width, y);
            ctx.fillStyle = '#666';
            ctx.fillText(`${db} dB`, 4, y - 2);
        }
        const freqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
        for (let f of freqs) {
            const x = invLogScale(f);
            ctx.moveTo(x, 0);
            ctx.lineTo(x, eqCanvas.height);
            ctx.fillStyle = '#666';
            ctx.fillText(`${f < 1000 ? f : f / 1000 + 'k'}`, x + 2, eqCanvas.height - 6);
        }
        ctx.stroke();
    }
    function drawEQCurve() {
        const freqs = new Float32Array(eqCanvas.width);
        for (let i = 0; i < freqs.length; i++) {
            freqs[i] = logScale(i);
        }
        let totalMag = new Float32Array(freqs.length).fill(0);
        let phase = new Float32Array(freqs.length);
        for (let f of filters) {
            const mag = new Float32Array(freqs.length);
            f.getFrequencyResponse(freqs, mag, phase);
            for (let i = 0; i < mag.length; i++) {
                totalMag[i] += 20 * Math.log10(mag[i]);
            }
        }
        ctx.beginPath();
        for (let i = 0; i < totalMag.length; i++) {
            const y = gainToY(totalMag[i]);
            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
        }
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    function drawPoints() {
        for (let i = 0; i < bands.length; i++) {
            const x = invLogScale(bands[i].freq);
            const y = gainToY(bands[i].gain);
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#f90';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        }
    }
    function renderEQ() {
        resizeCanvas();
        ctx.clearRect(0, 0, eqCanvas.width, eqCanvas.height);
        drawGrid();
        drawEQCurve();
        drawPoints();
        requestAnimationFrame(renderEQ);
    }
    renderEQ();

    let activePoint = null;
    eqCanvas.addEventListener('mousedown', (e) => {
        const rect = eqCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (let i = 0; i < bands.length; i++) {
            const px = invLogScale(bands[i].freq);
            const py = gainToY(bands[i].gain);
            if (Math.hypot(px - x, py - y) < 10) {
                activePoint = i;
                break;
            }
        }
    });
    eqCanvas.addEventListener('mousemove', (e) => {
        if (activePoint === null) return;
        const rect = eqCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const freq = logScale(x);
        const gain = yToGain(y);
        bands[activePoint].freq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq));
        bands[activePoint].gain = Math.max(MIN_GAIN, Math.min(MAX_GAIN, gain));
        filters[activePoint].frequency.value = bands[activePoint].freq;
        filters[activePoint].gain.value = bands[activePoint].gain;
    });
    window.addEventListener('mouseup', () => {
        activePoint = null;
    });
    function resetEQ() {
        for (let i = 0; i < bands.length; i++) {
            bands[i].gain = 0;
            filters[i].gain.value = 0;
        }
    }

});