const defaultExercises = ["Bench Press", "Squat", "Deadlift", "Shoulder Press", "Lat Pulldown", "Biceps Curl", "Triceps Pushdown", "Leg Press", "Chest Fly", "Row Machine"];

document.addEventListener('DOMContentLoaded', () => {
    const workoutForm = document.getElementById('workout-form');
    const exerciseSelect = document.getElementById('exerciseSelect');
    const exerciseEdit = document.getElementById('exerciseEdit');
    const setsInput = document.getElementById('sets');
    const repsInput = document.getElementById('reps');
    const workoutList = document.getElementById('workout-list');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const totalSetsEl = document.getElementById('total-sets');
    const totalRepsEl = document.getElementById('total-reps');

    // Array to store workouts
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];

    // Initialize list
    renderWorkouts();
    updateStats();

    // Populate default exercises
    defaultExercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex;
        option.textContent = ex;
        exerciseSelect.appendChild(option);
    });
    if (exerciseSelect.options.length > 0) {
        exerciseEdit.value = exerciseSelect.value;
    }

    exerciseSelect.addEventListener('change', () => {
        exerciseEdit.value = exerciseSelect.value;
    });

    exerciseEdit.addEventListener('input', () => {
        const selectedOption = exerciseSelect.options[exerciseSelect.selectedIndex];
        if (selectedOption) {
            selectedOption.value = exerciseEdit.value;
            selectedOption.text = exerciseEdit.value || "Custom Exercise";
        }
    });

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(reg => {
                console.log('Service Worker registered successfully.', reg);
            }).catch(err => {
                console.log('Service Worker registration failed:', err);
            });
        });
    }

    // Form submit handler
    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const exercise = exerciseEdit.value.trim();
        const sets = setsInput.value;
        const reps = repsInput.value;

        if (exercise && sets && reps) {
            const newWorkout = {
                id: Date.now().toString(),
                name: exercise,
                sets: sets,
                reps: reps
            };

            workouts.push(newWorkout);
            saveWorkouts();
            renderWorkouts();
            updateStats();

            // Reset form
            workoutForm.reset();
            if (exerciseSelect.options.length > 0) {
                exerciseSelect.selectedIndex = 0;
                exerciseEdit.value = exerciseSelect.value;
            }
            exerciseEdit.focus();
        }
    });

    // Delete handler
    workoutList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            workouts = workouts.filter(workout => workout.id !== id);
            saveWorkouts();
            renderWorkouts();
            updateStats();
        }
    });

    // Clear All handler
    clearAllBtn.addEventListener('click', () => {
        if (workouts.length > 0 && confirm('Are you sure you want to clear all exercises?')) {
            workouts = [];
            saveWorkouts();
            renderWorkouts();
            updateStats();
        }
    });

    function updateStats() {
        let totalSets = 2;
        let totalReps = 10;

        workouts.forEach(workout => {
            const sets = parseInt(workout.sets, 10) || 0;
            const reps = parseInt(workout.reps, 10) || 0;
            totalSets += sets;
            totalReps += (sets * reps);
        });

        totalSetsEl.textContent = totalSets;
        totalRepsEl.textContent = totalReps;
    }

    function saveWorkouts() {
        localStorage.setItem('workouts', JSON.stringify(workouts));
    }

    function renderWorkouts() {
        workoutList.innerHTML = '';

        if (workouts.length === 0) {
            workoutList.innerHTML = '<li class="empty-state">No exercises added yet. Start lifting!</li>';
            return;
        }

        workouts.forEach(workout => {
            const li = document.createElement('li');
            li.classList.add('workout-item');
            
            li.innerHTML = `
                <div class="workout-info">
                    <div class="workout-name">${escapeHTML(workout.name)}</div>
                    <div class="workout-details">
                        <span>${escapeHTML(workout.sets)}</span> sets × <span>${escapeHTML(workout.reps)}</span> reps
                    </div>
                </div>
                <button class="delete-btn" data-id="${workout.id}">Delete</button>
            `;
            
            workoutList.appendChild(li);
        });
    }

    // Helper to prevent XSS
    function escapeHTML(str) {
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
