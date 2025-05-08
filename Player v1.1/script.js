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

    // Audio
    const audio = new Audio();
    let tracks = [];
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isShuffled = false;
    let repeatMode = 'none'; // 'none', 'all', 'one'
    let isDraggingTimeline = false;
    let isDraggingVolume = false;

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

    // Playback controls
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevTrack);
    nextBtn.addEventListener('click', playNextTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    volumeBtn.addEventListener('click', toggleMute);

    // Timeline dragging
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

    // Volume dragging
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

    // Handle file upload
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

    function loadTrack(index) {
        if (index < 0 || index >= tracks.length) return;
        currentTrackIndex = index;
        const track = tracks[index];

        audio.src = track.url;
        audio.load();
        currentSongTitle.textContent = track.name;
        currentSongArtist.textContent = 'Неизвестный исполнитель';

        playlist.querySelectorAll('.playlist-item').forEach(item => item.classList.remove('active'));
        const activeItem = playlist.querySelector(`.playlist-item[data-index="${index}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        updateTimelineProgress();
        totalTimeElement.textContent = '0:00';
    }

    function togglePlay(forcePlay) {
        if (tracks.length === 0) return;

        if (forcePlay === true || audio.paused) {
            audio.play().then(() => {
                isPlaying = true;
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            }).catch(error => console.error('Playback failed:', error));
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

    // Drag & Drop (Full-screen drop zone)
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
    audio.volume = 1;
    updateVolumeUI();

    
});