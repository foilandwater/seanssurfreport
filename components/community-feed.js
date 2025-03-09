// community-feed.js
class CommunityFeed {
    constructor() {
        this.setupToggle(); // Set up toggle immediately
        this.init(); // Fetch posts asynchronously
    }

    setupToggle() {
        const feed = document.getElementById('community-feed');
        const handle = document.querySelector('.feed-handle');
        
        if (!feed || !handle) {
            console.error('Community Feed elements not found:', { feed, handle });
            return;
        }

        handle.addEventListener('click', () => {
            console.log('Handle clicked, toggling hidden class'); // Debug log
            feed.classList.toggle('hidden');
        });
    }

    async init() {
        try {
            await this.fetchDiscoursePosts();
        } catch (error) {
            console.error('Failed to initialize Community Feed:', error);
        }
    }

    async fetchDiscoursePosts() {
        try {
            const response = await fetch('https://community.seanssurfreport.com/latest.json');
            const data = await response.json();
            const postsContainer = document.getElementById('discourse-posts');
            
            if (!postsContainer) {
                console.error('Discourse posts container not found');
                return;
            }

            // Get category names from the category list in the response
            const categories = data.categories.reduce((acc, category) => {
                acc[category.id] = category.name;
                return acc;
            }, {});

            // Get latest 3 topics
            const latestTopics = data.topic_list.topics.slice(0, 3);
            
            postsContainer.innerHTML = latestTopics.map(topic => {
                const categoryName = categories[topic.category_id] || 'Uncategorized';
                const titleWords = topic.title.split(' ').slice(0, 6).join(' ');
                return `
                    <div class="post-preview">
                        <a href="https://community.seanssurfreport.com/t/${topic.slug}/${topic.id}" 
                           target="_blank">[${categoryName}] ${titleWords}${topic.title.split(' ').length > 6 ? '...' : ''}</a>
                        <small>${new Date(topic.created_at).toLocaleDateString()}</small>
                    </div>
                `;
            }).join('');

            // Add some basic styling
            const style = document.createElement('style');
            style.textContent = `
                .post-preview {
                    margin-bottom: 5px;
                    font-size: 0.9rem;
                }
                .post-preview a {
                    text-decoration: none;
                    color: #66b3ff; /* Light blue for contrast on dark background */
                }
                .post-preview a:hover {
                    text-decoration: underline;
                }
                .post-preview small {
                    display: block;
                    color: #ccc; /* Light gray for contrast */
                }
            `;
            postsContainer.appendChild(style);
        } catch (error) {
            console.error('Error fetching Discourse posts:', error);
            const postsContainer = document.getElementById('discourse-posts');
            if (postsContainer) {
                postsContainer.innerHTML = '<p>Unable to load community posts</p>';
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing CommunityFeed');
    new CommunityFeed();
});

export default CommunityFeed;