import TfIdf from 'tf-idf-search'
import {blogs} from "../datas/blog.js";
import {sendResponse} from "../utils/response.js";
import natural from "natural";
import {removeStopwords} from "stopword";

const tf_idf = new TfIdf()
// Menggunakan PorterStemmer dari natural
const stemmer = natural.PorterStemmer;

export const getBlogs = async (req, res) => {
    const query = req.query.search;
    try {
        if (!query) {
            return sendResponse(res, true, blogs, 'All Data');
        }

        // Lakukan stemming pada query dan hapus stopwords
        const stemmedQuery = removeStopwords(query.split(' '))
            .map(word => stemmer.stem(word))
            .join(' ');

        const blogContent = blogs.map((blog) => {
            const combinedText = `${blog.title} ${blog.author} ${blog.content}`.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();
            return removeStopwords(combinedText.split(' '))
                .map(word => stemmer.stem(word))
                .join(' ');
        });

        // Tambahkan setiap dokumen ke corpus
        let corpus = tf_idf.createCorpusFromStringArray(
            blogContent
        )

        // Gunakan query yang sudah di-stem dan di-filter stopwords
        let searchResults = tf_idf.rankDocumentsByQuery(stemmedQuery);

        const result = searchResults.filter((result) => result.index < blogs.length)
            .map((result) => {
                const blog = blogs[result.index];
                return {
                    ...blog,
                    score: result.similarityIndex,
                    token: result.document
                };
            });

        return sendResponse(res, true, result, 'Articles ranked by TF-IDF');
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
