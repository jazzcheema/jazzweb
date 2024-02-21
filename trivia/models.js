"use strict";

const BASE_API_URL = "https://rithm-jeopardy.herokuapp.com/api/";


/** Game class: provides functionality for fetching Jeopardy data from the API
 *    and handling non-UI game logic.
 *
 *  Game will have:
 *  - numCategories: integer
 *  - numCluesPerCat: integer
 *  - categories:
 *    [
 Category {
        title: "Math",
        clues: [
         Clue {question: "2+2", answer: "4", showing: null},
         Clue {question: "1+1", answer: "2", showing: null},
         ... 3 more clues ...
         ],
       },
 Category {
       title: "Literature",
        clues: [
         Clue {question: "Hamlet Author", answer: "Shakespeare", showing: null},
         Clue {question: "Bell Jar Author", answer: "Plath", showing: null}, ...
        ],
       }, ...4 more Categories ...
 ]
 */
class Game {

  constructor(numCategories = 6, numCluesPerCat = 5) {
    this.numCategories = numCategories;
    this.numCluesPerCat = numCluesPerCat;
    this.categories = [];
  }

  /**
   * Simple function to fetch a large batch of high-level raw category
   * data from jService API.
   *
   * Accepts:
   *   - count: int
   *
   * Returns array of raw category objects:
   *
   * [{id, title, clues_count}, {id, title, clues_count}, ... ]
   */

  async fetchCategoryBatch(count) {
    const categoriesParams = new URLSearchParams({ count: 20 });
    const response = await fetch(
      `${BASE_API_URL}categories?${categoriesParams}`,
      {
        method: "GET"
      }
    );
    return await response.json();
  }

  /** Get this.numCategories random category IDs from API.
   *
   * Returns array of category ids, eg [4, 12, 5, 9, 20, 1]
   */
  async getRandomCategoryIds() {

    const categoryBatchResults = await this.fetchCategoryBatch();
    const categoryIdCollection = categoryBatchResults.map
      (category => category.id);
    let randomIDs = _.sampleSize(categoryIdCollection, this.numCategories);

    return randomIDs;
  }


  /** Sets up the category data for game instance:
   *
   * - get random category Ids (randomizer)
   * - gets data for each category
   * - populates categories array
   */
  // Pushes our category into an array within Game Class of other categories we
  //  can use in the game. Separate instances of Category.
  //--> Returns and object of title & clues array, per instance.
  async populateCategoryData() {

    const catIds = await this.getRandomCategoryIds();

    for (const catId of catIds) {
      const categoryData = await Category.getCategory(catId);
      const categoryInstance = new Category
        (categoryData.title, categoryData.clues);

      this.categories.push(categoryInstance);
    }
  }
}

/** Category class: holds category data
 *
 *  Category will have:
 *   - title: string
 *   - clues: array of Clue instances [Clue {}, Clue {}, ...]
 */
class Category {

  /** Construct each Category instance from:
   *  - title: string
   *  - clues: array of Clue instances [Clue {}, Clue {}, ...]
   */
  constructor(title, clues) {
    this.title = title;
    this.clues = clues;
  }

  /** Static method to fetch all the information for a particular
   * category from jService API.
   *
   * Accepts:
   *   - id: int
   *
   * Returns raw object of category info from API:
   *
   * { id, title, clues_count, clues }
   */
  static async fetchCategoryDetail(id) {

    const response = await fetch(
      `${BASE_API_URL}category?id=${id}`,
      {
        method: "GET"
      }
    );

    return await response.json();
  }


  /** Static method to return new Category instance with data about a category:
   *
   * Accepts:
   *  - id: integer
   *  - numCluesPerCat: integer
   *
   * Returns Category { title: "Literature", clues: clue-array }
   *
   * Where clue-array is:
   *   [
   *      Clue {question: "Hamlet Author", answer: "Shakespeare", showing: null},
   *      Clue {question: "Bell Jar Author", answer: "Plath", showing: null},
   *      ... 3 more ...
   *   ]
   */
  static async getCategory(id, numCluesPerCat = 5) {

    const categoryInfo = await this.fetchCategoryDetail(id);

    //shuffle method to ensure the clues are rearranged
    const clueCollection = _.shuffle(categoryInfo.clues).map(clue =>
      new Clue(clue.question, clue.answer));
    return new Category(categoryInfo.title, clueCollection);
  }
}

/** Clue class: holds clue data and showing status
 *
 * Clue will have:
 *  - question: string
 *  - answer: string
 *  - showing: default of null, then string of either "question" or "answer"
 */
class Clue {

  /** Construct each Clue instance from:
   *  - question: string
   *  - answer: string
   */
  constructor(question, answer) {
    this.question = question;
    this.answer = answer;
    this.showing = null;
  }

  /** Update showing status on Clue, depending on current state
   * Returns: undefined
   */
  updateShowingStatus() {
    this.showing = (!this.showing) ? "question" : "answer";
  }
}
