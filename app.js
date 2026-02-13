// ===== BAKING APP - Main Application Logic =====

// ===== DATA MODELS =====

class Recipe {
    constructor(name, ingredients, steps, tags = [], temp = '', time = '', notes = '', id = null) {
        this.id = id || Date.now().toString();
        this.name = name;
        this.ingredients = Array.isArray(ingredients) ? ingredients : ingredients.split('\n').filter(i => i.trim());
        this.steps = Array.isArray(steps) ? steps : steps.split('\n').filter(s => s.trim());
        this.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(t => t);
        this.temp = temp;
        this.time = time;
        this.notes = notes;
        this.favorite = false;
        this.createdAt = Date.now();
    }
}

class Alarm {
    constructor(time, label = '', repeat = 'once', customDays = [], id = null) {
        this.id = id || Date.now().toString();
        this.time = time; // HH:MM format
        this.label = label;
        this.repeat = repeat; // once, daily, weekdays, weekends, custom
        this.customDays = customDays; // [0-6] for custom
        this.enabled = true;
        this.createdAt = Date.now();
    }
}

class Timer {
    constructor(duration, label = '', id = null) {
        this.id = id || Date.now().toString();
        this.duration = duration; // in seconds
        this.label = label;
        this.remaining = duration;
        this.startTime = null;
        this.pausedTime = null;
        this.running = false;
    }
}

class Settings {
    constructor() {
        this.version = '1.0';
        this.notificationsEnabled = false;
        this.soundEnabled = true;
    }
}

// ===== MAIN APP CLASS =====

class BakingApp {
    constructor() {
        this.recipes = [];
        this.alarms = [];
        this.timers = [];
        this.settings = new Settings();
        this.currentView = 'home';
        this.currentRecipeScale = 1;
        this.currentRecipe = null;

        // Stopwatch
        this.stopwatch = {
            startTime: null,
            elapsedTime: 0,
            running: false,
            splits: [],
            interval: null
        };

        // Dog tips
        this.dogTips = [
            { text: "Always bring butter to room temperature for better creaming. One must exercise patience and refinement - I shall sit in my favourite spot and wait gracefully.", author: "- Bailey" },
            { text: "PREHEAT YOUR OVEN WHILE YOU PREP! I just called dog phone to double check and they said the same thing! Wait, which knob was it again?!", author: "- Nellie" },
            { text: "Measure flour by spooning it into the cup, not scooping. Precision is the mark of a sophisticated baker. I wouldn't dream of doing it any other way. Nellie scoops with her paws. Uncivilised.", author: "- Bailey" },
            { text: "Room temperature eggs mix better into batters! I rang dog phone to ask why and knocked three eggs off the counter while reaching for it. They still mixed in fine off the floor!", author: "- Nellie" },
            { text: "Don't overmix cake batter - it makes it tough. A gentle, dignified approach yields the finest results. I eat my treats the same way - delicately, in my favourite spot.", author: "- Bailey" },
            { text: "Let cookies cool on the pan for 2 minutes before moving! I tried to wait but I got nervous and ate them all in about 4 seconds. They were still good though!", author: "- Nellie" },
            { text: "Use parchment paper for easy cleanup. A tidy kitchen is the sign of a distinguished baker. Nellie's kitchen looks like a crime scene. If the paper isn't placed correctly, I shall bark until someone fixes it.", author: "- Bailey" },
            { text: "Test cakes with a toothpick - it should come out clean! I ate the toothpick. And then the cake. And then the wrapper. I should probably call dog phone about this.", author: "- Nellie" },
            { text: "Chill cookie dough for better texture. I shall wait with the composure of royalty. And if the dough isn't chilled to my standard, I will simply bark until it is.", author: "- Bailey" },
            { text: "Always check your oven temperature with a thermometer! I tripped over the oven door, bumped into the table, and the thermometer went flying. Dog phone said 180 degrees so let's go with that!", author: "- Nellie" },
            { text: "Brown butter adds incredible nutty flavor to cookies. Watch it carefully and with a discerning eye - much like how I observe my meals before eating each bite with care. Bang bang! ...oh sorry, force of habit.", author: "- Bailey" },
            { text: "Sift your dry ingredients for the fluffiest cakes! I tried sifting but the flour went EVERYWHERE and now I look like a ghost and I'm sneezing and slightly panicking!", author: "- Nellie" },
            { text: "A pinch of salt enhances sweetness in any dessert. A small but wise adjustment - the kind of sensible decision that separates the refined from the reckless. I shan't name names, but she knows who she is.", author: "- Bailey" },
            { text: "Let bread dough rise in a warm spot! I sat on it to keep it warm because I didn't know what else to do. Just called dog phone and they said that's wrong. But it tasted amazing so who's really wrong here?!", author: "- Nellie" },
            { text: "Bloom cocoa powder in hot water for the deepest chocolate flavour. It's a subtle art - much like the way I position myself on the sofa for optimal sunbeam coverage.", author: "- Bailey" },
            { text: "Read the WHOLE recipe before you start baking! I got halfway through and realised I needed cream cheese and I don't even know what that IS so I used regular cheese. Honestly it was delicious! Ten out of ten!", author: "- Nellie" },
            { text: "Weigh your ingredients with a kitchen scale for perfect consistency. Guesswork is for amateurs. I have seen Nellie measure flour by 'vibes'. I had to leave the room.", author: "- Bailey" },
            { text: "Don't open the oven door too early or your cake might sink! I opened it seven times to check. Then I barked at it. It sank. But I ate the whole thing and it was INCREDIBLE so I don't see the problem!", author: "- Nellie" },
            { text: "Let cakes cool completely in the tin before frosting. Rushing is beneath us. I once waited forty-five minutes for my dinner without so much as a whimper. Nellie would have eaten the tin by then.", author: "- Bailey" },
            { text: "Grease your baking pans really well so nothing sticks! I used way too much butter and the pan shot across the counter like a hockey puck. The cake went with it. Caught it in my mouth though. Best cake I've ever had!", author: "- Nellie" },
            { text: "Toast nuts in a dry pan before adding them to batter. The aroma should fill the kitchen like a fine perfume - not unlike the way I announce my entrance to any room.", author: "- Bailey" },
            { text: "Measure baking powder carefully - too much and things taste weird! I couldn't read the teaspoon markings so I just dumped some in. The muffins tasted like a swimming pool. They were delicious!", author: "- Nellie" },
            { text: "Fold egg whites gently with a spatula to keep the air in. Vigorous stirring is simply undignified. I once watched Nellie use a garden spade. I still haven't recovered.", author: "- Bailey" },
            { text: "Scrape down the sides of your mixing bowl halfway through! I forgot and ended up with a big lump of unmixed flour in my cupcakes. I told everyone it was a surprise filling.", author: "- Nellie" },
            { text: "Use real vanilla extract, never imitation. One can always tell the difference. I have a refined palate and I will not be deceived by substitutes. Nellie once used gravy granules instead of cocoa powder and said it was 'fine'. It was not fine.", author: "- Bailey" },
            { text: "Zest your citrus BEFORE you juice it! I juiced the lemon first and then tried to zest it and it just squished everywhere and now my eyes sting and I can't find dog phone to ask for help!", author: "- Nellie" }
        ];
        this.currentTipIndex = 0;

        // Audio context for beeps
        this.audioContext = null;

        // Alarm checking interval
        this.alarmCheckInterval = null;
        this.triggeredAlarmId = null;

        this.init();
    }

    // ===== INITIALIZATION =====

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupNavigation();
        this.startAlarmChecker();
        this.updateStats();
        this.showDogTip();
        this.renderRecipes();
        this.renderAlarms();
        this.updateTimers();
        this.checkNotificationPermission();

        // Rotate dog tips every 10 seconds
        setInterval(() => this.showDogTip(), 10000);
    }

    setupEventListeners() {
        // Recipe search
        const searchInput = document.getElementById('recipeSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderRecipes());
        }

        // Favorites filter
        const favCheckbox = document.getElementById('showFavoritesOnly');
        if (favCheckbox) {
            favCheckbox.addEventListener('change', () => this.renderRecipes());
        }

        // Alarm repeat select
        const alarmRepeat = document.getElementById('alarmRepeat');
        if (alarmRepeat) {
            alarmRepeat.addEventListener('change', (e) => {
                const customDaysGroup = document.getElementById('customDaysGroup');
                customDaysGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
            });
        }

        // Unit converters
        this.setupConverters();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.getAttribute('data-view');
                this.switchView(view);
            });
        });
    }

    switchView(viewName) {
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-view') === viewName) {
                item.classList.add('active');
            }
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`view-${viewName}`).classList.add('active');

        this.currentView = viewName;
    }

    // ===== LOCAL STORAGE =====

    loadData() {
        const data = localStorage.getItem('bakingAppData');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.recipes = parsed.recipes || [];
                this.alarms = parsed.alarms || [];
                this.settings = parsed.settings || new Settings();

                // Load Simone's classics if no recipes
                if (this.recipes.length === 0) {
                    this.loadSimonesClassics();
                }
            } catch (e) {
                console.error('Error loading data:', e);
                this.loadSimonesClassics();
            }
        } else {
            this.loadSimonesClassics();
        }
    }

    saveData() {
        const data = {
            recipes: this.recipes,
            alarms: this.alarms,
            settings: this.settings,
            version: '1.0'
        };
        localStorage.setItem('bakingAppData', JSON.stringify(data));
    }

    loadSimonesClassics() {
        const classics = [
            new Recipe(
                "Classic Chocolate Chip Cookies",
                "2 1/4 cups all-purpose flour\n1 tsp baking soda\n1 tsp salt\n1 cup butter, softened\n3/4 cup granulated sugar\n3/4 cup packed brown sugar\n2 large eggs\n2 tsp vanilla extract\n2 cups chocolate chips",
                "Preheat oven to 375°F (190°C)\nMix flour, baking soda and salt in a bowl\nBeat butter and sugars until creamy\nAdd eggs and vanilla, beat well\nGradually blend in flour mixture\nStir in chocolate chips\nDrop rounded tablespoons onto ungreased cookie sheets\nBake 9-11 minutes or until golden brown\nCool on baking sheet for 2 minutes",
                "cookies, chocolate, classic",
                "375°F / 190°C",
                "9-11 min",
                "Makes about 5 dozen cookies. Best when slightly underbaked for chewy texture!"
            ),
            new Recipe(
                "Simple Vanilla Cupcakes",
                "1 1/2 cups all-purpose flour\n1 1/2 tsp baking powder\n1/4 tsp salt\n1/2 cup butter, softened\n1 cup sugar\n2 large eggs\n2 tsp vanilla extract\n1/2 cup milk",
                "Preheat oven to 350°F (175°C) and line muffin tin\nWhisk together flour, baking powder, and salt\nCream butter and sugar until fluffy\nBeat in eggs one at a time\nAdd vanilla\nAlternately add flour mixture and milk, beginning and ending with flour\nFill cupcake liners 2/3 full\nBake 18-20 minutes until toothpick comes out clean\nCool completely before frosting",
                "cupcakes, vanilla, birthday",
                "350°F / 175°C",
                "18-20 min",
                "Makes 12 cupcakes. Perfect base for any frosting!"
            ),
            new Recipe(
                "Easy Banana Bread",
                "2 cups all-purpose flour\n1 tsp baking soda\n1/4 tsp salt\n1/2 cup butter, melted\n3/4 cup brown sugar\n2 eggs, beaten\n2 1/3 cups mashed overripe bananas (about 4-5)\n1 tsp vanilla",
                "Preheat oven to 350°F (175°C)\nGrease a 9x5 inch loaf pan\nMix flour, baking soda and salt\nIn another bowl, mix butter and brown sugar\nStir in eggs, mashed bananas, and vanilla\nFold in flour mixture until just combined\nPour into prepared pan\nBake for 60-65 minutes\nLet cool in pan for 10 minutes",
                "bread, banana, quick bread",
                "350°F / 175°C",
                "60-65 min",
                "Use very ripe bananas for best flavor. Freezes well!"
            ),
            new Recipe(
                "Fluffy Pancakes",
                "1 1/2 cups all-purpose flour\n3 1/2 tsp baking powder\n1 tsp salt\n1 tbsp white sugar\n1 1/4 cups milk\n1 egg\n3 tbsp butter, melted\n1 tsp vanilla",
                "Mix flour, baking powder, salt and sugar in a bowl\nMake a well in center\nPour in milk, egg, melted butter and vanilla\nMix until just combined (lumps are okay!)\nHeat a griddle over medium-high heat\nPour 1/4 cup batter for each pancake\nCook until bubbles form and edges are dry\nFlip and cook until golden brown",
                "pancakes, breakfast, quick",
                "Medium-high heat",
                "2-3 min per side",
                "Don't overmix! Lumpy batter makes fluffy pancakes."
            ),
            new Recipe(
                "Classic Brownies",
                "1/2 cup butter\n1 cup sugar\n2 eggs\n1 tsp vanilla extract\n1/3 cup cocoa powder\n1/2 cup all-purpose flour\n1/4 tsp salt\n1/4 tsp baking powder",
                "Preheat oven to 350°F (175°C)\nGrease an 8x8 inch pan\nMelt butter, remove from heat\nStir in sugar, eggs, and vanilla\nBeat in cocoa, flour, salt, and baking powder\nSpread batter into prepared pan\nBake for 25-30 minutes\nDo not overbake - toothpick should have moist crumbs\nCool before cutting",
                "brownies, chocolate, dessert",
                "350°F / 175°C",
                "25-30 min",
                "For fudgier brownies, slightly underbake. For cakier, bake full time."
            ),
            new Recipe(
                "Lemon Drizzle Cake",
                "1 3/4 cups all-purpose flour\n2 tsp baking powder\n1/2 tsp salt\n3/4 cup butter, softened\n1 cup sugar\n3 eggs\n1/2 cup milk\nZest of 2 lemons\n1/4 cup lemon juice\nFor glaze: 1 cup powdered sugar, 2-3 tbsp lemon juice",
                "Preheat oven to 350°F (175°C)\nGrease and flour a loaf pan\nMix flour, baking powder, and salt\nCream butter and sugar until fluffy\nBeat in eggs one at a time\nAdd lemon zest and juice\nAlternately add flour mixture and milk\nPour into pan and bake 45-50 minutes\nMix powdered sugar and lemon juice for glaze\nPoke holes in warm cake and pour glaze over",
                "cake, lemon, citrus",
                "350°F / 175°C",
                "45-50 min",
                "The glaze soaks into the warm cake for amazing flavor!"
            ),
            new Recipe(
                "Oatmeal Raisin Cookies",
                "1 cup butter, softened\n1 cup brown sugar\n1/2 cup white sugar\n2 eggs\n1 tsp vanilla\n1 1/2 cups all-purpose flour\n1 tsp baking soda\n1 tsp cinnamon\n1/2 tsp salt\n3 cups rolled oats\n1 cup raisins",
                "Preheat oven to 350°F (175°C)\nCream together butter and sugars\nBeat in eggs and vanilla\nCombine flour, baking soda, cinnamon and salt\nStir into butter mixture\nMix in oats and raisins\nDrop by rounded spoonfuls onto ungreased cookie sheets\nBake 10-12 minutes until golden\nCool on wire rack",
                "cookies, oatmeal, raisins",
                "350°F / 175°C",
                "10-12 min",
                "Can substitute raisins with chocolate chips or dried cranberries!"
            ),
            new Recipe(
                "Simple Sugar Cookies",
                "2 3/4 cups all-purpose flour\n1 tsp baking soda\n1/2 tsp baking powder\n1 cup butter, softened\n1 1/2 cups white sugar\n1 egg\n1 tsp vanilla extract",
                "Preheat oven to 375°F (190°C)\nMix flour, baking soda, and baking powder\nCream butter and sugar until smooth\nBeat in egg and vanilla\nGradually blend in dry ingredients\nRoll rounded teaspoonfuls of dough into balls\nPlace on ungreased cookie sheets\nBake 8-10 minutes until edges are golden\nLet cool on baking sheet briefly",
                "cookies, sugar, simple",
                "375°F / 190°C",
                "8-10 min",
                "Roll in colored sugar before baking for a festive touch!"
            ),
            new Recipe(
                "Cinnamon Rolls",
                "For dough: 3 1/4 cups flour, 1/4 cup sugar, 1 packet yeast, 1/2 cup milk, 1/4 cup butter, 1/4 cup water, 1 egg\nFor filling: 1/4 cup butter melted, 1/2 cup brown sugar, 2 tbsp cinnamon\nFor icing: 1 cup powdered sugar, 2 tbsp milk, 1/2 tsp vanilla",
                "Mix 2 cups flour, sugar, yeast, and salt\nHeat milk, butter, and water to 120°F\nAdd to flour mixture with egg, beat well\nStir in remaining flour to make soft dough\nKnead 5 minutes, let rise 1 hour\nRoll into 15x9 inch rectangle\nBrush with melted butter, sprinkle with brown sugar and cinnamon\nRoll up and cut into 12 slices\nPlace in greased pan, let rise 30 minutes\nBake at 375°F for 20-25 minutes\nMix icing ingredients and drizzle over warm rolls",
                "cinnamon rolls, yeast, breakfast",
                "375°F / 190°C",
                "20-25 min + rising time",
                "Make the night before and refrigerate for easy morning baking!"
            ),
            new Recipe(
                "Basic Pie Crust",
                "2 1/2 cups all-purpose flour\n1 tsp salt\n1 tsp sugar\n1 cup cold butter, cubed\n6-8 tbsp ice water",
                "Mix flour, salt, and sugar in a bowl\nCut in cold butter until mixture resembles coarse crumbs\nAdd ice water 1 tablespoon at a time\nMix until dough just comes together\nDivide dough in half and form into disks\nWrap and refrigerate at least 1 hour\nRoll out on floured surface when ready to use",
                "pie crust, pastry, basic",
                "Varies by filling",
                "Prep time",
                "Makes 2 crusts. Keep everything cold for flakiest results!"
            )
        ];

        this.recipes = classics;
        this.saveData();
    }

    // ===== DOG TIPS =====

    showDogTip() {
        const tip = this.dogTips[this.currentTipIndex];
        const tipCard = document.getElementById('dogTipCard');
        const tipAvatar = document.getElementById('tipMascotAvatar');
        const tipAuthor = document.getElementById('dogTipAuthor');
        const tipText = document.getElementById('dogTipText');

        if (tipText) tipText.textContent = tip.text;

        // Determine which dog is speaking and style accordingly
        const isBailey = tip.author.includes('Bailey');
        if (tipAvatar) {
            tipAvatar.className = 'tip-mascot-avatar ' + (isBailey ? 'tip-avatar-bailey' : 'tip-avatar-nellie');
        }
        if (tipAuthor) {
            tipAuthor.textContent = isBailey ? 'Bailey says...' : 'Nellie says...';
        }
        if (tipCard) {
            tipCard.className = 'dog-tip-card card ' + (isBailey ? 'tip-bailey-theme' : 'tip-nellie-theme');
        }

        this.currentTipIndex = (this.currentTipIndex + 1) % this.dogTips.length;
    }

    // ===== STATS =====

    updateStats() {
        const recipeCount = this.recipes.length;
        const favoriteCount = this.recipes.filter(r => r.favorite).length;

        const recipeEl = document.getElementById('recipeCount');
        const favEl = document.getElementById('favoriteCount');

        if (recipeEl) recipeEl.textContent = recipeCount;
        if (favEl) favEl.textContent = favoriteCount;
    }

    // ===== QUICK ACTIONS =====

    quickStartTimer() {
        this.switchView('timers');
    }

    quickAddRecipe() {
        this.switchView('recipes');
        setTimeout(() => this.showAddRecipeForm(), 100);
    }

    quickStartStopwatch() {
        this.switchView('stopwatch');
    }

    quickAddAlarm() {
        this.switchView('alarms');
        setTimeout(() => this.showAddAlarmForm(), 100);
    }

    // ===== RECIPES =====

    renderRecipes() {
        const container = document.getElementById('recipesList');
        if (!container) return;

        const searchTerm = document.getElementById('recipeSearch')?.value.toLowerCase() || '';
        const showFavoritesOnly = document.getElementById('showFavoritesOnly')?.checked || false;

        let filtered = this.recipes.filter(recipe => {
            const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
                                recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                                recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm));
            const matchesFavorite = !showFavoritesOnly || recipe.favorite;
            return matchesSearch && matchesFavorite;
        });

        // Render tags
        const allTags = [...new Set(this.recipes.flatMap(r => r.tags))];
        const tagFilters = document.getElementById('tagFilters');
        if (tagFilters) {
            tagFilters.innerHTML = allTags.map(tag =>
                `<button class="tag-btn" onclick="app.filterByTag('${tag}')">${tag}</button>`
            ).join('');
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state-mascot card">
                    <div class="empty-mascot-img empty-nellie"></div>
                    <h3>No recipes found!</h3>
                    <p>Nellie is frantically waiting for your first recipe! She's already eaten the example one. And the paper it was written on. She called dog phone to ask if that's okay.</p>
                    <button class="btn btn-primary" onclick="app.showAddRecipeForm()">+ Add Your First Recipe</button>
                </div>`;
            return;
        }

        container.innerHTML = filtered.map(recipe => `
            <div class="recipe-card" onclick="app.showRecipeDetail('${recipe.id}')">
                <div class="recipe-header">
                    <div>
                        <h3 class="recipe-title">${recipe.name}</h3>
                        <div class="recipe-tags">
                            ${recipe.tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="recipe-card-actions">
                        <div class="recipe-favorite" onclick="event.stopPropagation(); app.toggleFavorite('${recipe.id}')">
                            ${recipe.favorite ? '⭐' : '☆'}
                        </div>
                        <button class="btn btn-small btn-danger recipe-delete-btn" onclick="event.stopPropagation(); app.deleteRecipe('${recipe.id}')">Delete</button>
                    </div>
                </div>
                <div class="recipe-meta">
                    ${recipe.temp ? `<span>🌡️ ${recipe.temp}</span>` : ''}
                    ${recipe.time ? `<span>⏱️ ${recipe.time}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    filterByTag(tag) {
        const searchInput = document.getElementById('recipeSearch');
        if (searchInput) {
            searchInput.value = tag;
            this.renderRecipes();
        }
    }

    toggleFavorite(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (recipe) {
            recipe.favorite = !recipe.favorite;
            this.saveData();
            this.renderRecipes();
            this.updateStats();
        }
    }

    showRecipeDetail(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        this.currentRecipe = recipe;
        this.currentRecipeScale = 1;

        const content = document.getElementById('recipeDetailContent');
        content.innerHTML = `
            <h2>${recipe.name}</h2>
            <div class="recipe-tags">
                ${recipe.tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
            </div>

            <div class="scale-controls">
                <span>Scale:</span>
                <button class="scale-btn" onclick="app.scaleRecipe(0.5)">0.5×</button>
                <button class="scale-btn active" onclick="app.scaleRecipe(1)">1×</button>
                <button class="scale-btn" onclick="app.scaleRecipe(2)">2×</button>
                <button class="scale-btn" onclick="app.scaleRecipe(3)">3×</button>
            </div>

            <div class="recipe-detail">
                <h3>Ingredients</h3>
                <ul id="scaledIngredients">
                    ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>

                <h3>Instructions</h3>
                <ol>
                    ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>

                ${recipe.temp ? `<p><strong>Temperature:</strong> ${recipe.temp}</p>` : ''}
                ${recipe.time ? `<p><strong>Time:</strong> ${recipe.time}</p>` : ''}
                ${recipe.notes ? `<p><strong>Notes:</strong> ${recipe.notes}</p>` : ''}
            </div>

            <div class="recipe-actions">
                <button class="btn btn-primary" onclick="app.editRecipe('${recipe.id}')">Edit</button>
                <button class="btn btn-danger" onclick="app.deleteRecipe('${recipe.id}')">Delete</button>
            </div>
        `;

        document.getElementById('recipeDetailModal').classList.add('active');
    }

    scaleRecipe(scale) {
        this.currentRecipeScale = scale;

        // Update active button
        document.querySelectorAll('.scale-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Scale ingredients
        const recipe = this.currentRecipe;
        const scaledList = document.getElementById('scaledIngredients');

        scaledList.innerHTML = recipe.ingredients.map(ing => {
            const scaled = this.scaleIngredient(ing, scale);
            return `<li>${scaled}</li>`;
        }).join('');
    }

    scaleIngredient(ingredient, scale) {
        if (scale === 1) return ingredient;

        // Try to find and scale numbers
        return ingredient.replace(/(\d+\.?\d*)\s*(\/\s*\d+)?/g, (match, num, fraction) => {
            let value = parseFloat(num);
            if (fraction) {
                // Handle fractions like "1/2"
                const parts = fraction.split('/');
                value = value + (1 / parseFloat(parts[1].trim()));
            }
            const scaled = value * scale;

            // Format nicely
            if (scaled % 1 === 0) return scaled.toString();
            if (scaled < 1) {
                // Try to convert to common fractions
                const fractions = {
                    0.25: '1/4',
                    0.33: '1/3',
                    0.5: '1/2',
                    0.66: '2/3',
                    0.75: '3/4'
                };
                const rounded = Math.round(scaled * 100) / 100;
                return fractions[rounded] || scaled.toFixed(2);
            }
            return scaled.toFixed(2);
        });
    }

    closeRecipeDetail() {
        document.getElementById('recipeDetailModal').classList.remove('active');
    }

    showAddRecipeForm() {
        document.getElementById('recipeFormTitle').textContent = 'Add Recipe';
        document.getElementById('recipeForm').reset();
        document.getElementById('recipeId').value = '';
        document.getElementById('recipeFormModal').classList.add('active');
    }

    editRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        this.closeRecipeDetail();

        document.getElementById('recipeFormTitle').textContent = 'Edit Recipe';
        document.getElementById('recipeName').value = recipe.name;
        document.getElementById('recipeTags').value = recipe.tags.join(', ');
        document.getElementById('recipeIngredients').value = recipe.ingredients.join('\n');
        document.getElementById('recipeSteps').value = recipe.steps.join('\n');
        document.getElementById('recipeTemp').value = recipe.temp;
        document.getElementById('recipeTime').value = recipe.time;
        document.getElementById('recipeNotes').value = recipe.notes;
        document.getElementById('recipeId').value = recipe.id;

        document.getElementById('recipeFormModal').classList.add('active');
    }

    saveRecipe(event) {
        event.preventDefault();

        const id = document.getElementById('recipeId').value;
        const name = document.getElementById('recipeName').value;
        const tags = document.getElementById('recipeTags').value;
        const ingredients = document.getElementById('recipeIngredients').value;
        const steps = document.getElementById('recipeSteps').value;
        const temp = document.getElementById('recipeTemp').value;
        const time = document.getElementById('recipeTime').value;
        const notes = document.getElementById('recipeNotes').value;

        if (id) {
            // Edit existing
            const recipe = this.recipes.find(r => r.id === id);
            if (recipe) {
                recipe.name = name;
                recipe.tags = tags.split(',').map(t => t.trim()).filter(t => t);
                recipe.ingredients = ingredients.split('\n').filter(i => i.trim());
                recipe.steps = steps.split('\n').filter(s => s.trim());
                recipe.temp = temp;
                recipe.time = time;
                recipe.notes = notes;
            }
        } else {
            // Add new
            const recipe = new Recipe(name, ingredients, steps, tags, temp, time, notes);
            this.recipes.push(recipe);
        }

        this.saveData();
        this.renderRecipes();
        this.updateStats();
        this.closeRecipeForm();
    }

    deleteRecipe(recipeId) {
        if (!confirm('Are you sure you want to delete this recipe?')) return;

        this.recipes = this.recipes.filter(r => r.id !== recipeId);
        this.saveData();
        this.renderRecipes();
        this.updateStats();

        // Close detail modal if it's open
        const modal = document.getElementById('recipeDetailModal');
        if (modal && modal.classList.contains('active')) {
            this.closeRecipeDetail();
        }
    }

    deleteAllRecipes() {
        if (this.recipes.length === 0) return;
        if (!confirm('Delete all recipes? This cannot be undone.')) return;
        this.recipes = [];
        this.saveData();
        this.renderRecipes();
        this.updateStats();
    }

    closeRecipeForm() {
        document.getElementById('recipeFormModal').classList.remove('active');
    }

    // ===== TIMERS =====

    addPresetTimer(seconds, label) {
        const timer = new Timer(seconds, label);
        timer.running = true;
        timer.startTime = Date.now();
        this.timers.push(timer);
        this.updateTimers();
    }

    addCustomTimer() {
        const minutes = parseInt(document.getElementById('customTimerMin').value) || 0;
        const seconds = parseInt(document.getElementById('customTimerSec').value) || 0;
        const label = document.getElementById('customTimerLabel').value || 'Custom Timer';

        const totalSeconds = minutes * 60 + seconds;
        if (totalSeconds <= 0) {
            alert('Please enter a valid time');
            return;
        }

        const timer = new Timer(totalSeconds, label);
        timer.running = true;
        timer.startTime = Date.now();
        this.timers.push(timer);
        this.updateTimers();

        // Reset form
        document.getElementById('customTimerMin').value = '5';
        document.getElementById('customTimerSec').value = '0';
        document.getElementById('customTimerLabel').value = '';
    }

    updateTimers() {
        const container = document.getElementById('activeTimers');
        if (!container) return;

        // Update running timers
        this.timers.forEach(timer => {
            if (timer.running && timer.startTime) {
                const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
                timer.remaining = timer.duration - elapsed;

                if (timer.remaining <= 0) {
                    timer.remaining = 0;
                    timer.running = false;
                    this.onTimerComplete(timer);
                }
            }
        });

        if (this.timers.length === 0) {
            container.innerHTML = `
                <div class="empty-state-mascot card">
                    <div class="empty-mascot-img empty-bailey"></div>
                    <h3>No active timers</h3>
                    <p>Bailey is poised and ready to oversee your baking with regal composure. Add a timer and he shall supervise - barking only if standards slip.</p>
                </div>`;
            return;
        }

        container.innerHTML = this.timers.map(timer => `
            <div class="timer-item">
                <div class="timer-label">${timer.label}</div>
                <div class="timer-display">${this.formatTime(timer.remaining)}</div>
                <div class="timer-controls">
                    ${timer.running
                        ? `<button class="btn btn-warning" onclick="app.pauseTimer('${timer.id}')">Pause</button>`
                        : `<button class="btn btn-success" onclick="app.resumeTimer('${timer.id}')">Resume</button>`
                    }
                    <button class="btn btn-secondary" onclick="app.resetTimer('${timer.id}')">Reset</button>
                    <button class="btn btn-danger" onclick="app.removeTimer('${timer.id}')">Remove</button>
                </div>
            </div>
        `).join('');

        // Continue updating if any timers are running
        if (this.timers.some(t => t.running)) {
            setTimeout(() => this.updateTimers(), 100);
        }
    }

    pauseTimer(timerId) {
        const timer = this.timers.find(t => t.id === timerId);
        if (timer && timer.running) {
            timer.running = false;
            timer.pausedTime = Date.now();
        }
        this.updateTimers();
    }

    resumeTimer(timerId) {
        const timer = this.timers.find(t => t.id === timerId);
        if (timer && !timer.running) {
            timer.running = true;
            const pausedDuration = timer.pausedTime ? Date.now() - timer.pausedTime : 0;
            timer.startTime += pausedDuration;
            timer.pausedTime = null;
        }
        this.updateTimers();
    }

    resetTimer(timerId) {
        const timer = this.timers.find(t => t.id === timerId);
        if (timer) {
            timer.remaining = timer.duration;
            timer.running = false;
            timer.startTime = null;
            timer.pausedTime = null;
        }
        this.updateTimers();
    }

    removeTimer(timerId) {
        this.timers = this.timers.filter(t => t.id !== timerId);
        this.updateTimers();
    }

    clearAllTimers() {
        if (this.timers.length === 0) return;
        if (!confirm('Remove all timers?')) return;
        this.timers = [];
        this.updateTimers();
    }

    onTimerComplete(timer) {
        this.playBeep();
        this.showNotification('Timer Complete!', `${timer.label} is done!`);

        document.getElementById('timerCompleteLabel').textContent = timer.label;
        document.getElementById('timerCompleteModal').classList.add('active');

        // Auto-remove after showing modal
        setTimeout(() => {
            this.removeTimer(timer.id);
        }, 500);
    }

    dismissTimerComplete() {
        document.getElementById('timerCompleteModal').classList.remove('active');
    }

    formatTime(totalSeconds) {
        if (totalSeconds < 0) totalSeconds = 0;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // ===== STOPWATCH =====

    startStopwatch() {
        if (!this.stopwatch.running) {
            this.stopwatch.running = true;
            this.stopwatch.startTime = Date.now() - this.stopwatch.elapsedTime;
            this.updateStopwatch();

            document.getElementById('stopwatchStartBtn').textContent = 'Pause';
            document.getElementById('stopwatchStartBtn').classList.remove('btn-success');
            document.getElementById('stopwatchStartBtn').classList.add('btn-warning');
            document.getElementById('stopwatchSplitBtn').disabled = false;
        } else {
            this.stopwatch.running = false;

            document.getElementById('stopwatchStartBtn').textContent = 'Resume';
            document.getElementById('stopwatchStartBtn').classList.remove('btn-warning');
            document.getElementById('stopwatchStartBtn').classList.add('btn-success');
        }
    }

    updateStopwatch() {
        if (!this.stopwatch.running) return;

        this.stopwatch.elapsedTime = Date.now() - this.stopwatch.startTime;

        const display = document.getElementById('stopwatchDisplay');
        if (display) {
            display.textContent = this.formatStopwatchTime(this.stopwatch.elapsedTime);
        }

        requestAnimationFrame(() => this.updateStopwatch());
    }

    formatStopwatchTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const tenths = Math.floor((ms % 1000) / 100);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    }

    splitStopwatch() {
        if (!this.stopwatch.running) return;

        const splitTime = this.stopwatch.elapsedTime;
        this.stopwatch.splits.push(splitTime);

        const splitsList = document.getElementById('splitsList');
        const splitNumber = this.stopwatch.splits.length;

        const splitItem = document.createElement('div');
        splitItem.className = 'split-item';
        splitItem.innerHTML = `
            <span class="split-number">Split ${splitNumber}</span>
            <span class="split-time">${this.formatStopwatchTime(splitTime)}</span>
        `;

        splitsList.insertBefore(splitItem, splitsList.firstChild);

        document.getElementById('copySplitsBtn').disabled = false;
        document.getElementById('clearSplitsBtn').disabled = false;
    }

    resetStopwatch() {
        this.stopwatch.running = false;
        this.stopwatch.startTime = null;
        this.stopwatch.elapsedTime = 0;
        this.stopwatch.splits = [];

        document.getElementById('stopwatchDisplay').textContent = '00:00:00.0';
        document.getElementById('splitsList').innerHTML = '';
        document.getElementById('stopwatchStartBtn').textContent = 'Start';
        document.getElementById('stopwatchStartBtn').classList.remove('btn-warning');
        document.getElementById('stopwatchStartBtn').classList.add('btn-success');
        document.getElementById('stopwatchSplitBtn').disabled = true;
        document.getElementById('copySplitsBtn').disabled = true;
        document.getElementById('clearSplitsBtn').disabled = true;
    }

    clearSplits() {
        if (this.stopwatch.splits.length === 0) return;
        this.stopwatch.splits = [];
        document.getElementById('splitsList').innerHTML = '';
        document.getElementById('copySplitsBtn').disabled = true;
        document.getElementById('clearSplitsBtn').disabled = true;
    }

    copySplits() {
        const splits = this.stopwatch.splits.map((time, index) =>
            `Split ${index + 1}: ${this.formatStopwatchTime(time)}`
        ).join('\n');

        navigator.clipboard.writeText(splits).then(() => {
            const btn = document.getElementById('copySplitsBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }

    // ===== ALARMS =====

    startAlarmChecker() {
        // Check alarms every 30 seconds
        this.alarmCheckInterval = setInterval(() => this.checkAlarms(), 30000);
        this.checkAlarms(); // Check immediately
    }

    checkAlarms() {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDay = now.getDay();

        this.alarms.forEach(alarm => {
            if (!alarm.enabled) return;
            if (alarm.time !== currentTime) return;

            // Check if alarm should trigger today
            let shouldTrigger = false;

            switch (alarm.repeat) {
                case 'once':
                    shouldTrigger = true;
                    alarm.enabled = false; // Disable after triggering
                    break;
                case 'daily':
                    shouldTrigger = true;
                    break;
                case 'weekdays':
                    shouldTrigger = currentDay >= 1 && currentDay <= 5;
                    break;
                case 'weekends':
                    shouldTrigger = currentDay === 0 || currentDay === 6;
                    break;
                case 'custom':
                    shouldTrigger = alarm.customDays.includes(currentDay);
                    break;
            }

            if (shouldTrigger) {
                this.triggerAlarm(alarm);
            }
        });

        this.saveData();
        this.renderAlarms();
    }

    triggerAlarm(alarm) {
        this.triggeredAlarmId = alarm.id;
        this.playBeep();
        this.showNotification('Alarm!', alarm.label || alarm.time);

        document.getElementById('alarmTriggerTime').textContent = alarm.time;
        document.getElementById('alarmTriggerLabel').textContent = alarm.label || 'Time to bake!';
        document.getElementById('alarmTriggerModal').classList.add('active');
    }

    snoozeAlarm(minutes) {
        const alarm = this.alarms.find(a => a.id === this.triggeredAlarmId);
        if (alarm) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + minutes);
            const snoozeTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const snoozeAlarm = new Alarm(snoozeTime, `${alarm.label} (Snoozed)`, 'once');
            this.alarms.push(snoozeAlarm);
            this.saveData();
            this.renderAlarms();
        }

        this.dismissAlarm();
    }

    dismissAlarm() {
        document.getElementById('alarmTriggerModal').classList.remove('active');
        this.triggeredAlarmId = null;
    }

    addPresetAlarm(minutes, label) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + minutes);
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const alarm = new Alarm(time, label, 'once');
        this.alarms.push(alarm);
        this.saveData();
        this.renderAlarms();
    }

    renderAlarms() {
        const container = document.getElementById('alarmsList');
        if (!container) return;

        if (this.alarms.length === 0) {
            container.innerHTML = `
                <div class="empty-state-mascot card">
                    <div class="empty-mascot-img empty-nellie"></div>
                    <h3>No alarms set</h3>
                    <p>Nellie will keep one ear up for you! She might nervously knock over the clock checking if it's time, but she means well. She's already called dog phone twice about it.</p>
                </div>`;
            return;
        }

        container.innerHTML = this.alarms.map(alarm => `
            <div class="alarm-item">
                <div class="alarm-info-section">
                    <div class="alarm-time">${alarm.time}</div>
                    ${alarm.label ? `<div class="alarm-label">${alarm.label}</div>` : ''}
                    <div class="alarm-repeat">${this.getRepeatText(alarm)}</div>
                </div>
                <div class="alarm-actions">
                    <div class="alarm-toggle ${alarm.enabled ? 'active' : ''}"
                         onclick="app.toggleAlarm('${alarm.id}')"></div>
                    <button class="btn btn-small btn-secondary" onclick="app.editAlarm('${alarm.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="app.deleteAlarm('${alarm.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    getRepeatText(alarm) {
        switch (alarm.repeat) {
            case 'once':
                return 'Once';
            case 'daily':
                return 'Every day';
            case 'weekdays':
                return 'Weekdays';
            case 'weekends':
                return 'Weekends';
            case 'custom':
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return alarm.customDays.map(d => days[d]).join(', ');
            default:
                return '';
        }
    }

    toggleAlarm(alarmId) {
        const alarm = this.alarms.find(a => a.id === alarmId);
        if (alarm) {
            alarm.enabled = !alarm.enabled;
            this.saveData();
            this.renderAlarms();
        }
    }

    showAddAlarmForm() {
        document.getElementById('alarmFormTitle').textContent = 'Add Alarm';
        document.getElementById('alarmForm').reset();
        document.getElementById('alarmId').value = '';
        document.getElementById('customDaysGroup').style.display = 'none';
        document.getElementById('alarmFormModal').classList.add('active');
    }

    editAlarm(alarmId) {
        const alarm = this.alarms.find(a => a.id === alarmId);
        if (!alarm) return;

        document.getElementById('alarmFormTitle').textContent = 'Edit Alarm';
        document.getElementById('alarmTime').value = alarm.time;
        document.getElementById('alarmLabel').value = alarm.label;
        document.getElementById('alarmRepeat').value = alarm.repeat;
        document.getElementById('alarmId').value = alarm.id;

        if (alarm.repeat === 'custom') {
            document.getElementById('customDaysGroup').style.display = 'block';
            document.querySelectorAll('.day-check').forEach(checkbox => {
                checkbox.checked = alarm.customDays.includes(parseInt(checkbox.value));
            });
        }

        document.getElementById('alarmFormModal').classList.add('active');
    }

    saveAlarm(event) {
        event.preventDefault();

        const id = document.getElementById('alarmId').value;
        const time = document.getElementById('alarmTime').value;
        const label = document.getElementById('alarmLabel').value;
        const repeat = document.getElementById('alarmRepeat').value;

        let customDays = [];
        if (repeat === 'custom') {
            customDays = Array.from(document.querySelectorAll('.day-check:checked'))
                              .map(cb => parseInt(cb.value));
        }

        if (id) {
            // Edit existing
            const alarm = this.alarms.find(a => a.id === id);
            if (alarm) {
                alarm.time = time;
                alarm.label = label;
                alarm.repeat = repeat;
                alarm.customDays = customDays;
            }
        } else {
            // Add new
            const alarm = new Alarm(time, label, repeat, customDays);
            this.alarms.push(alarm);
        }

        this.saveData();
        this.renderAlarms();
        this.closeAlarmForm();
    }

    deleteAlarm(alarmId) {
        if (!confirm('Delete this alarm?')) return;
        this.alarms = this.alarms.filter(a => a.id !== alarmId);
        this.saveData();
        this.renderAlarms();
    }

    clearAllAlarms() {
        if (this.alarms.length === 0) return;
        if (!confirm('Delete all alarms?')) return;
        this.alarms = [];
        this.saveData();
        this.renderAlarms();
    }

    closeAlarmForm() {
        document.getElementById('alarmFormModal').classList.remove('active');
    }

    // ===== NOTIFICATIONS & SOUND =====

    checkNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.settings.notificationsEnabled = true;
                const btn = document.getElementById('notificationPermBtn');
                if (btn) btn.textContent = '✓ Notifications Enabled';
            }
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.settings.notificationsEnabled = true;
                    document.getElementById('notificationPermBtn').textContent = '✓ Notifications Enabled';
                    this.saveData();
                }
            });
        } else {
            alert('Notifications are not supported in this browser');
        }
    }

    showNotification(title, body) {
        if (this.settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '🧁'
            });
        }
    }

    playBeep() {
        if (!this.settings.soundEnabled) return;

        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Could not play sound:', e);
        }
    }

    // ===== HELPERS - CONVERTERS =====

    setupConverters() {
        // Weight converter
        const weightInput = document.getElementById('weightInput');
        const weightUnit = document.getElementById('weightFromUnit');
        if (weightInput && weightUnit) {
            weightInput.addEventListener('input', () => this.convertWeight());
            weightUnit.addEventListener('change', () => this.convertWeight());
        }

        // Volume converter
        const volumeInput = document.getElementById('volumeInput');
        const volumeUnit = document.getElementById('volumeFromUnit');
        if (volumeInput && volumeUnit) {
            volumeInput.addEventListener('input', () => this.convertVolume());
            volumeUnit.addEventListener('change', () => this.convertVolume());
        }

        // Temperature converter
        const tempInput = document.getElementById('tempInput');
        const tempUnit = document.getElementById('tempFromUnit');
        if (tempInput && tempUnit) {
            tempInput.addEventListener('input', () => this.convertTemperature());
            tempUnit.addEventListener('change', () => this.convertTemperature());
        }
    }

    switchConverter(type) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        document.querySelectorAll('.converter-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`converter-${type}`).classList.add('active');
    }

    convertWeight() {
        const value = parseFloat(document.getElementById('weightInput').value) || 0;
        const unit = document.getElementById('weightFromUnit').value;

        // Convert to grams first
        let grams = 0;
        switch (unit) {
            case 'g': grams = value; break;
            case 'oz': grams = value * 28.3495; break;
            case 'lb': grams = value * 453.592; break;
            case 'kg': grams = value * 1000; break;
        }

        const result = document.getElementById('weightResult');
        result.innerHTML = `
            ${grams.toFixed(2)} g<br>
            ${(grams / 28.3495).toFixed(2)} oz<br>
            ${(grams / 453.592).toFixed(2)} lb<br>
            ${(grams / 1000).toFixed(2)} kg
        `;
    }

    convertVolume() {
        const value = parseFloat(document.getElementById('volumeInput').value) || 0;
        const unit = document.getElementById('volumeFromUnit').value;

        // Convert to ml first
        let ml = 0;
        switch (unit) {
            case 'ml': ml = value; break;
            case 'l': ml = value * 1000; break;
            case 'cup': ml = value * 236.588; break;
            case 'tbsp': ml = value * 14.7868; break;
            case 'tsp': ml = value * 4.92892; break;
            case 'floz': ml = value * 29.5735; break;
        }

        const result = document.getElementById('volumeResult');
        result.innerHTML = `
            ${ml.toFixed(2)} ml<br>
            ${(ml / 1000).toFixed(2)} L<br>
            ${(ml / 236.588).toFixed(2)} cups<br>
            ${(ml / 14.7868).toFixed(2)} tbsp<br>
            ${(ml / 4.92892).toFixed(2)} tsp<br>
            ${(ml / 29.5735).toFixed(2)} fl oz
        `;
    }

    convertTemperature() {
        const value = parseFloat(document.getElementById('tempInput').value) || 0;
        const unit = document.getElementById('tempFromUnit').value;

        let celsius, fahrenheit;
        if (unit === 'c') {
            celsius = value;
            fahrenheit = (value * 9/5) + 32;
        } else {
            fahrenheit = value;
            celsius = (value - 32) * 5/9;
        }

        const result = document.getElementById('tempResult');
        result.innerHTML = `${celsius.toFixed(1)}°C / ${fahrenheit.toFixed(1)}°F`;
    }

    calculatePanConversion() {
        const originalArea = parseFloat(document.getElementById('originalPan').value);
        const newArea = parseFloat(document.getElementById('newPan').value);

        const ratio = newArea / originalArea;

        const result = document.getElementById('panResult');
        result.innerHTML = `
            <strong>Recipe Adjustment:</strong><br>
            Multiply all ingredients by <strong>${ratio.toFixed(2)}</strong><br>
            ${ratio > 1 ? 'Increase' : 'Decrease'} baking time by approximately ${Math.abs(Math.round((ratio - 1) * 20))}%
        `;
        result.classList.add('active');
    }

    showSubstitution() {
        const ingredient = document.getElementById('substitutionSelect').value;
        const result = document.getElementById('substitutionResult');

        if (!ingredient) {
            result.classList.remove('active');
            return;
        }

        const substitutions = {
            butter: {
                title: 'Butter Substitutes',
                options: [
                    '1 cup butter = 1 cup margarine',
                    '1 cup butter = 7/8 cup vegetable oil',
                    '1 cup butter = 1 cup shortening',
                    '1 cup butter = 1 cup coconut oil (for baking)'
                ],
                warning: 'Note: Butter adds flavor! Substitutes may affect taste and texture.'
            },
            egg: {
                title: 'Egg Substitutes',
                options: [
                    '1 egg = 1/4 cup applesauce (for binding)',
                    '1 egg = 1 tbsp ground flaxseed + 3 tbsp water (let sit 5 min)',
                    '1 egg = 3 tbsp aquafaba (chickpea liquid)',
                    '1 egg = 1/4 cup mashed banana'
                ],
                warning: 'Best for binding. May affect rise and texture in some recipes.'
            },
            milk: {
                title: 'Milk Substitutes',
                options: [
                    '1 cup milk = 1 cup almond milk',
                    '1 cup milk = 1 cup soy milk',
                    '1 cup milk = 1 cup oat milk',
                    '1 cup milk = 1 cup coconut milk (canned for richness)'
                ],
                warning: 'Most work 1:1 in baking. Choose unsweetened for best results.'
            },
            buttermilk: {
                title: 'Buttermilk Substitutes',
                options: [
                    '1 cup buttermilk = 1 cup milk + 1 tbsp lemon juice (let sit 5 min)',
                    '1 cup buttermilk = 1 cup milk + 1 tbsp white vinegar (let sit 5 min)',
                    '1 cup buttermilk = 3/4 cup plain yogurt + 1/4 cup milk'
                ],
                warning: 'Let acidified milk sit 5 minutes before using.'
            },
            sugar: {
                title: 'White Sugar Substitutes',
                options: [
                    '1 cup white sugar = 1 cup brown sugar (adds moisture)',
                    '1 cup white sugar = 3/4 cup honey (reduce liquid by 1/4 cup)',
                    '1 cup white sugar = 3/4 cup maple syrup (reduce liquid by 3 tbsp)',
                    '1 cup white sugar = 2/3 cup agave nectar (reduce liquid)'
                ],
                warning: 'Liquid sweeteners require recipe adjustments. Reduce other liquids!'
            },
            flour: {
                title: 'All-Purpose Flour Substitutes',
                options: [
                    '1 cup AP flour = 1 cup + 2 tbsp cake flour',
                    '1 cup AP flour = 7/8 cup bread flour',
                    '1 cup AP flour = 1 cup whole wheat flour (denser results)',
                    '1 cup AP flour = 1 1/4 cup gluten-free flour blend'
                ],
                warning: 'Different flours have different proteins. Results will vary!'
            },
            bakingpowder: {
                title: 'Baking Powder Substitutes',
                options: [
                    '1 tsp baking powder = 1/4 tsp baking soda + 1/2 tsp cream of tartar',
                    '1 tsp baking powder = 1/4 tsp baking soda + 1/2 cup buttermilk (reduce liquid by 1/2 cup)'
                ],
                warning: 'Baking powder is double-acting. Substitutes may affect rise timing.'
            },
            vanilla: {
                title: 'Vanilla Extract Substitutes',
                options: [
                    '1 tsp vanilla extract = 1 tsp vanilla bean paste',
                    '1 tsp vanilla extract = 1/2 vanilla bean (scraped)',
                    '1 tsp vanilla extract = 1 tsp almond extract (stronger flavor)',
                    '1 tsp vanilla extract = 1 tsp maple syrup (different flavor profile)'
                ],
                warning: 'Vanilla is unique! Other extracts will change the flavor.'
            }
        };

        const sub = substitutions[ingredient];
        result.innerHTML = `
            <h4>${sub.title}</h4>
            <ul>
                ${sub.options.map(opt => `<li>${opt}</li>`).join('')}
            </ul>
            <div class="warning">⚠️ ${sub.warning}</div>
        `;
        result.classList.add('active');
    }
}

// ===== INITIALIZE APP =====

let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new BakingApp();
});
