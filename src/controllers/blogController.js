import TfIdf from 'tf-idf-search'
import {blogs} from "../datas/blog.js";
import {sendResponse} from "../utils/response.js";
import natural from "natural";
const tf_idf = new TfIdf()
// Menggunakan PorterStemmer dari natural
const stemmer = natural.PorterStemmer;

export const getBlogs = async (req, res) => {
    const query = req.query.search;
    try {
        if (!query) {
            return sendResponse(res, true, blogs, 'All Data')
        }

        // Lakukan stemming pada query
        const stemmedQuery = query.split(' ').map(word => stemmer.stem(word)).join(' ');

        const blogContent = blogs.map((blog) => {
            const stemmedTitle = blog.title.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().split(' ').map(word => stemmer.stem(word)).join(' ');
            const stemmedAuthor = blog.author.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().split(' ').map(word => stemmer.stem(word)).join(' ');
            const stemmedContent = blog.content.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().split(' ').map(word => stemmer.stem(word)).join(' ');
            return `${stemmedTitle} - ${stemmedAuthor} - ${stemmedContent} - ${blog.date}`;
        });

        let corpus = tf_idf.createCorpusFromStringArray(
            blogContent
        )

        // Gunakan query yang sudah di-stem
        let search = tf_idf.rankDocumentsByQuery(stemmedQuery)

        let result = []
        search.forEach(item => {
            if (item.similarityIndex > 0) {
                const blog = blogs[item.index];
                result.push({
                    ...blog,
                    score: item.similarityIndex,
                })
            }
        })

        return sendResponse(res, true, result, 'Articles ranked by TF-IDF')
    } catch (e) {
        console.error('Error fetching articles:', e);
        sendResponse(res, false, null, 'Failed to fetch articles', 500);
    }
}

export const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = blogs.find((item) => item.id === parseInt(id));
        if (!blog) {
            return sendResponse(res, false, null, 'blog data not found', 404);
        }
        return sendResponse(res, true, blog, 'Article found by TF-IDF');
    } catch (e) {
        console.error('Error fetching articles:', e);
        sendResponse(res, false, null, 'Failed to fetch articles', 500);
    }
}
