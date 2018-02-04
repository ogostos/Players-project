<template>
  <div id="app">
    <!-- TOP layer -->
    <div class="top">
      <!-- FIlter Block -->
      <div class="filter">
        <select v-model="filterSelected">
          <option selected hidden value="">Select field to filter</option>
          <option v-for="(t, i) of tagsFiltered" :key="i" :value="t">{{t}}</option>
        </select>
        <div v-show="lessEqualGreater">
          <button @click="comparisonSign = '-1'" :class="{comparisonNotDefined: comparisonSign !== '-1'}">≤</button>
          <button @click="comparisonSign = '0'" :class="{comparisonNotDefined: comparisonSign !== '0'}">=</button>
          <button @click="comparisonSign = '1'" :class="{comparisonNotDefined: comparisonSign !== '1'}">≥</button>
        </div>
        <div v-show="filterSelected" @keyup.enter="filter" @keyup.esc="reset">
          <input v-if="filterSelected === 'Name'" v-model="keyword" type="text" placeholder="input text to filter"/>
          <select v-else-if="filterSelected === 'Team'" v-model="keyword">
            <option selected hidden value="null">Select team to filter</option>
            <option v-for="(key, team) of clubs" :key="key" :value="team">{{team}}</option>
          </select>
          <div v-else-if="filterSelected === 'Gender'">
            <input  type="radio" id="fitlerMale" value="male" v-model="keyword"/>
            <label for="fitlerMale">Male</label>
            <input  type="radio" id="fitlerFemale" value="female" v-model="keyword"/>
            <label for="fitlerFemale">Female</label>
          </div>
          <div v-else-if="filterSelected === 'Active'">
            <input type="radio" id="activeFilterTrue" :value="true" v-model="keyword"/>
            <label for="activeFilterTrue">Active</label>
            <input type="radio" id="activeFilterFalse" :value="false" v-model="keyword"/>
            <label for="activeFilterFalse">Notactive</label>
          </div>
          <input v-else type="number" min="0" step="1" @keydown="checkPositiveInteger" v-model.number="keyword"  placeholder="input number to filter"/>
        </div>
        <button @click="filter" :disabled="disabledFilterButton">Filter</button>
        <button @click="reset" :disabled="disabledFilterButton">Reset</button>
      </div>
      <!-- Number of results displayd on page -->
      <div class="limit">
        <span>Show |</span>
        <a v-for="(l, i) of limits" :key="i" :class="{limitButtons:true, limitButtonsActive: limit === l}" @click="setLimit(l)">{{l}}</a>
        <span>| results on page.</span>
      </div>
    </div>
    <!-- Modal Box for adding new player -->
    <div v-if="modalBox" class="modal" @click.self="cancelAdding" @keyup.esc="cancelAdding">
      <div class="modalInside">
        <button id="close" @click="cancelAdding" v-show="!successAdd">✖</button>
        <form action="" v-if="!successAdd">
          <h1>New player's card</h1>
          <div>
            <label for="nameNew">Name</label>
            <input type="text" id="nameNew" v-model="form.name"/>
            <input type="checkbox" id="isActiveNew" v-model="form.isActive">
            <label for="isActiveNew">Active Player</label>
          </div>
          <div>
            <label for="teamNew">Team</label>
            <select name="" id="teamNew" v-model="form.team">
              <option selected disabled hidden value="">Select team</option>
              <option v-for="(key, team) of clubs" :key="key" :value="team">{{team}}</option>
            </select>
          </div>
          <div>
            <label for="ageNew">Age</label>
            <input type="number" @keydown="checkPositiveInteger" min="0" step="1" id="ageNew" v-model.number="form.age"/>
          </div>
          <div>
            <label>Gender</label>
            <input type="radio" id="maleNew" value="male" v-model="form.gender"/>
            <label for="maleNew">Male</label>
            <input type="radio" id="femaleNew" value="female" v-model="form.gender"/>
            <label for="femaleNew">Female</label>
          </div>
          <div>
            <label for="goalsNew">Goals scored</label>
            <input type="number" @keydown="checkPositiveInteger" min="0" step="1" id="goalsNew" v-model.number="form.goals"/>
          </div>
          <div>
            <label for="appearancesNew">Total Appearances</label>
            <input type="number" @keydown="checkPositiveInteger" min="0" step="1" id="appearancesNew" v-model.number="form.appearances"/>
          </div>
          <div>
            <label for="yellowCardsNew">Yellow Cards</label>
            <input type="number" @keydown="checkPositiveInteger" min="0" step="1" id="yellowCardsNew" v-model.number="form.yellowCards"/>
          </div>
          <div>
            <label for="redCardsNew">Red Cards</label>
            <input type="number" @keydown="checkPositiveInteger" min="0" step="1" id="redCardsNew" v-model.number="form.redCards"/>
          </div>
          <div class="buttonNew">
            <button @click="add" :disabled="notAllFieldsSet">Save</button>
            <button @click="cancelAdding">Cancel</button>
          </div>
        </form>
        <div v-else>
          <h1>Success!</h1>
          <h2>Player</h2>
          <h1 class="playerAdded">{{form.name}}</h1>
          <h2>was added to database.</h2>
        </div>
      </div>
    </div>
    <!-- TABLE -->
    <div class="table">
      <!-- Sorting row -->
      <div class="sortRow">
        <!-- Sorting buttons -->
        <div class="sortPanel" v-if="showSortPanel">
          <div>
            <button :class="{sortSelected: sortSelected === 'isActive'}" @click="sort('isActive')">✖</button>
            <button :class="{sortSelected: sortSelected === 'notActive'}" @click="sort('notActive')">✔</button>
          </div>
          <!-- empty div to fill grid -->
          <div></div>
          <div>
            <button :class="{sortSelected: sortSelected === 'name'}" @click="sort('name')">↑</button>
            <button :class="{sortSelected: sortSelected === 'nameD'}" @click="sort('nameD')">↓</button>
          </div>
          <div>
            <button :class="{sortSelected: sortSelected === 'gender'}" @click="sort('gender')">F</button>
            <button :class="{sortSelected: sortSelected === 'genderD'}" @click="sort('genderD')">M</button>
          </div>
          <div>
            <button :class="{sortSelected: sortSelected === 'age'}" @click="sort('age')">↑</button>
            <button :class="{sortSelected: sortSelected === 'ageD'}" @click="sort('ageD')">↓</button>
          </div>
          <div>
            <button :class="{sortSelected: sortSelected === 'team/name'}" @click="sort('team/name')">↑</button>
            <button :class="{sortSelected: sortSelected === 'team/nameD'}" @click="sort('team/nameD')">↓</button>
          </div>
          <div>
            <button :class="{sortSelected: sortSelected === 'appearances'}" @click="sort('appearances')">↑</button>
            <button :class="{sortSelected: sortSelected === 'appearancesD'}" @click="sort('appearancesD')">↓</button>
          </div>
          <div>
            <button :class="{sortSelected: sortSelected === 'goals'}" @click="sort('goals')">↑</button>
            <button :class="{sortSelected: sortSelected === 'goalsD'}" @click="sort('goalsD')">↓</button>
          </div>
          <div>
            <button :class="{sortSelected: sortSelected === 'yellowCards'}" @click="sort('yellowCards')">↑</button>
            <button :class="{sortSelected: sortSelected === 'yellowCardsD'}" @click="sort('yellowCardsD')">↓</button>
          </div>
          <div>
            <button :class="{sortSelected: sortSelected === 'redCards'}" @click="sort('redCards')">↑</button>
            <button :class="{sortSelected: sortSelected === 'redCardsD'}" @click="sort('redCardsD')">↓</button>
          </div>
          <div>
            <button @click="reset">Reset</button>
            <button @click="showSortPanel = false">Hide</button>
          </div>
        </div>
        <!--Buttons to add a player and to open sorting panel -->
        <div class="top-buttons" v-else>
          <button @click="open">Add a New Player</button>
          <button @click="showSortPanel = true">Show sorting controllers</button>
        </div>
      </div>
      <!-- Head of table -->
      <div class="row head">
        <div v-for="(title,val) of tags" :key="val">{{val}}</div>
      </div>
      <!-- Rows of table -->
      <div v-for="(p,i) of players" :key="p['.key']" class="row rowtable" @keyup.enter="saveRow(p, i)" @keyup.esc="cancelEdit(p, i)">
        <!-- Conditional rednering -->
        <!-- If in editing mode -->
        <template v-if="!p.editMode">
          <span :class="{isActive: true, isChecked: p.isActive}"></span>
          <img :src="p.picture"/>
          <span>{{p.name}}</span>
          <span>{{p.gender}}</span>
          <span>{{p.age}}</span>
          <span>{{p.team.name}}</span>
          <span>{{p.appearances}}</span>
          <span>{{p.goals}}</span>
          <span>{{p.yellowCards}}</span>
          <span>{{p.redCards}}</span>
          <!-- Buttons to edit or remove row, initially not displayed -->
          <div class="editing">
            <button @click="editRow(p['.key'], i)">Edit</button>
            <button @click="removeRow(p['.key'], i)">Remove</button>
          </div>
        </template>
        <!-- Normal/view mode -->
        <template v-else>
          <div class="checkboxInput">
            <input type="checkbox" :id="'active' + i" v-model="p.isActive"/>
            <label :for="'active' + i"></label>
          </div>
          <img :src="p.picture"/>
          <input type="text" v-model="p.name"/>
          <div class="gender">
            <input type="radio" value="male" :id="'male' + i"  v-model="p.gender"/>
            <label :for="'male' + i">Male</label>
            <input type="radio" value="female" :id="'female' + i" v-model="p.gender"/>
            <label :for="'female' + i">Female</label>
          </div>
          <input type="number" @keydown="checkPositiveInteger" min="0" step="1" v-model.number="p.age"/>
          <select type="text" v-model="p.team.name">
            <option v-for="(key, team) of clubs" :key="key" :value="team">{{team}}</option>
          </select>
          <input type="number" @keydown="checkPositiveInteger" min="0" step="1" v-model.number="p.appearances"/>
          <input type="number" @keydown="checkPositiveInteger" min="0" step="1" v-model.number="p.goals"/>
          <input type="number" @keydown="checkPositiveInteger" min="0" step="1" v-model.number="p.yellowCards"/>
          <input type="number" @keydown="checkPositiveInteger" min="0" step="1" v-model.number="p.redCards"/>
          <div class="editingButtons">
            <button @click="saveRow(p, i)">Save</button>
            <button @click="cancelEdit(p['.key'], i)">Cancel</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { players } from './firebase'

export default {
  data () {
    return {
      // used to init Head, Filter elems, and process Filter function
      tags: {
        Active: 'isActive',
        Image: null,
        Name: 'name',
        Gender: 'gender',
        Age: 'age',
        Team: 'team/name',
        Appearances: 'appearances',
        Goals: 'goals',
        [`Yellow Cards`]: 'yellowCards',
        [`Red Cards`]: 'redCards'
      },
      // New player panel referencing form object
      // form object init new players data with some default values
      // stores client inputs and passes info to db
      form: {
        age: null,
        name: null,
        team: '',
        goals: null,
        appearances: null,
        yellowCards: null,
        redCards: null,
        gender: null,
        isActive: false,
        picture: 'http://placehold.it/32x32'
      },
      clubs: {}, // collection of team name-id
      limit: 10, // default number of players shown on page
      limits: [10, 20, 50, 100], // array of posiible options
      filterSelected: '', // sets filter tag selection to default value
      keyword: null, // filter by this query
      showSortPanel: false, // toggle sort panel
      comparisonSign: '0', // default is equal
      modalBox: false, // toggle modal box
      sortSelected: null, // keep state of sort button selected
      successAdd: false
    }
  },
  mounted () {
    // append props for descending order, editing, fill clubs
    const c = this.clubs
    players.once('value', function (snap) {
      snap.forEach(function (x) {
        const o = x.val()
        if (!Object.keys(c).includes(o.team.name)) {
          c[o.team.name] = o.team.id
        }
        players.child(x.key).update({
          ageD: -o.age,
          appearancesD: -o.appearances,
          goalsD: -o.goals,
          yellowCardsD: -o.yellowCards,
          redCardsD: -o.redCards,
          notActive: !o.isActive,
          genderD: o.gender === 'male' ? 'female' : 'male',
          editMode: false
        })
      })
    })
    this.setD('name')
    this.setD('team/name')
  },
  // bind data from db to local var
  firebase () {
    return {
      players: players.limitToFirst(this.limit),
      filterNameArray: players
    }
  },
  computed: {
    // array for filter tags
    tagsFiltered () {
      return Object.keys(this.tags).filter(x => x !== 'Image')
    },
    // tags with number inputs
    lessEqualGreater () {
      let possibleTags = ['Age', 'Appearances', 'Goals', 'Yellow Cards', 'Red Cards']
      return possibleTags.includes(this.filterSelected)
    },
    // disable filter button till filter inputs are set
    disabledFilterButton () {
      return !this.filterSelected || this.keyword === null || !this.comparisonSign
    },
    // local descending prop
    teamID () {
      return this.clubs[this.form.team]
    },
    // checking inputs on adding new player panel
    notAllFieldsSet () {
      return Object.entries(this.form).some(([key, val]) => key === 'picture' || key === 'isActive' ? false : val === null)
    }
  },
  watch: {
    // whenever limit is changed rebind
    // to use reactive data should be unbind everytime
    limit (val) {
      this.$unbind('players')
      this.$bindAsArray('players', players.limitToFirst(val))
    },
    // whenever tag is changed, empty search key
    filterSelected () {
      this.keyword = null
    }
  },
  methods: {
    // adding new player
    open () {
      this.modalBox = true
    },
    add (event) {
      event.preventDefault()
      players.push({
        isActive: this.form.isActive,
        name: this.form.name,
        age: this.form.age,
        appearances: this.form.appearances,
        goals: this.form.goals,
        yellowCards: this.form.yellowCards,
        redCards: this.form.redCards,
        team: {
          id: this.teamID,
          name: this.form.team
        },
        gender: this.form.gender,
        ageD: -this.form.age,
        picture: this.form.picture,
        appearancesD: -this.form.appearances,
        goalsD: -this.form.goals,
        yellowCardsD: -this.form.yellowCards,
        redCardsD: -this.form.redCards,
        notActive: !this.form.isActive,
        genderD: this.form.gender === 'male' ? 'female' : 'male',
        editMode: false
      })
      // everytime new player is added, descending props related to strings
      // should be recalculated, not like numeric descending props
      this.setD('name')
      this.setD('team/name')
      this.successAdd = true
      setTimeout(this.cancelAdding, 2500)
    },
    cancelAdding () {
      this.modalBox = false
      this.successAdd = false
      for (let p in this.form) {
        if (p === 'team') this.form[p] = ''
        else if (p === 'isActive') this.form[p] = false
        else if (p !== 'picture') this.form[p] = null
      }
    },
    setLimit (l) {
      this.limit = l
      this.reset()
    },
    sort (tag) {
      this.sortSelected = tag
      this.$unbind('players')
      this.$bindAsArray('players', players.orderByChild(tag).limitToFirst(this.limit))
    },
    // for descending sorting of names, we loop through list
    // and assign arbitrary value to new prop
    setD (tag) {
      let index = 1
      players.orderByChild(tag).once('value', function (snap) {
        snap.forEach(function (x) {
          players.child(x.key).update({
            [tag + 'D']: -index
          })
          index++
        })
      })
    },
    reset () {
      this.filterSelected = ''
      this.sortSelected = null
      this.keyword = null
      this.comparisonSign = '0'
      this.$unbind('players')
      this.$bindAsArray('players', players.limitToFirst(this.limit))
    },
    filter () {
      // first unbind to work on db
      this.$unbind('players')
      // if string is filter, we use local copy of db filtered
      // yet we still provide info to main db
      if (this.filterSelected === 'Name') {
        const re = new RegExp(this.keyword, 'ig')
        this.$bindAsArray('players', players)
        this.players = this.players.filter(x => re.test(x.name)).slice(0, this.limit)
      } else {
        // other than string, we apply methods from firebase API
        switch (this.comparisonSign) {
          case '-1': this.$bindAsArray('players', players.orderByChild(this.tags[this.filterSelected]).endAt(this.keyword).limitToFirst(this.limit))
            break
          case '1': this.$bindAsArray('players', players.orderByChild(this.tags[this.filterSelected]).startAt(this.keyword).limitToFirst(this.limit))
            break
          default: this.$bindAsArray('players', players.orderByChild(this.tags[this.filterSelected]).equalTo(this.keyword).limitToFirst(this.limit))
            break
        }
      }
    },
    editRow (key, index) {
      this.players[index].editMode = true
      players.child(key).update({editMode: true})
    },
    removeRow (key, index) {
      this.players.splice(index, 1)
      players.child(key).remove()
    },
    saveRow (player, index) {
      const key = player['.key']
      this.players[index].editMode = false
      players.child(key).update({
        age: player.age,
        ageD: -player.age,
        appearances: player.appearances,
        appearancesD: -player.appearances,
        gender: player.gender,
        genderD: player.gender === 'male' ? 'female' : 'male',
        goals: player.goals,
        goalsD: -player.goals,
        isActive: player.isActive,
        notActive: !player.isActive,
        name: player.name,
        redCards: player.redCards,
        redCardsD: -player.redCards,
        yellowCards: player.yellowCards,
        yellowCardsD: -player.yellowCardsD,
        team: {
          id: player.team.id,
          name: player.team.name
        },
        editMode: false
      })
      this.setD('name')
      this.setD('team/name')
    },
    cancelEdit (key, index) {
      this.players[index].editMode = false
      players.child(key).update({editMode: false})
    },
    checkPositiveInteger (event) {
      let c = event.keyCode
      if (!([8, 9, 13].includes(c) || (c >= 37 && c <= 40) || (c >= 48 && c <= 57) || (c >= 96 && c <= 105))) {
        event.preventDefault()
      }
    }
  }
}
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
  input {
    text-align: center;
  }
  button {
    background: none;
    outline: none;
    border: 2px solid black;
    padding: 5px;
    border-radius: 3px;
    color: black;
    font-size: 1rem;
  }
  button:hover:enabled,
  button:active:enabled,
  button:focus:enabled {
    background: black;
    color: white;
    border: 2px solid black;
  }
  button:disabled {
    border: 2px solid silver;
    color: silver;
  }

/* Modal css*/
  .modal {
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modalInside {
    width: 500px;
    height: 510px;
    background: #33CC66;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  /* form */
  form > h1 {
    align-self: center;
    margin: 0;
  }
  form {
    display: flex;
    flex-direction: column;
    height: 90%;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 30px 30px 30px;
  }
  form > div > label:first-child {
    font-weight: bold;
  }
  .gender {
    display: flex;
  }
  .playerAdded {
    color: white;
  }
  /* buttons*/
  .buttonNew {
    align-self: center;
    width: 60%;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  #close {
    align-self: flex-end;
    font-size: 2rem;
    background: none;
    outline: none;
    border: none;
    color: grey;
    margin-right: 5px;
    cursor: pointer;
  }
  #close:hover, #close:active, #close:focus {
    color: black;
  }
/***************/

/* Filter css*/
  .top {
    display: grid;
    width: 85%;
    grid-template-columns: 6fr 2fr;
    justify-items: center;
    align-content: center;
    align-items: center;
    margin: 15px auto;
  }
  .filter {
    width:800px;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .filter input, .filter select,
  .filter label {
    font-size: 1rem;
  }
  /* buttons */
  .top-buttons {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 30%;
  }
  .filter > div > button {
    width: 40px;
    font-size: 1rem;
    font-weight: bold;
  }
  .comparisonNotDefined {
    border: 2px solid gainsboro;
    color: gainsboro;
  }
/***************/
/* Sorting css*/
  .sortRow {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    margin-bottom: 3px;
  }
  .sortPanel {
    display: grid;
    grid-template-columns: repeat(2, 1fr 1fr 2fr) repeat(4, 1fr) 1.2fr;
    width: 100%;
    align-self: flex-end;
  }
  .sortPanel > div {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .sortPanel > div > button.sortSelected {
    background: black;
    color: white;
    border: 1px solid black;
    outline: none;
    border-radius: 3px;
    font-size: 1rem;
    padding-bottom: 2px;
    padding-top: 2px;
  }
  .sortPanel > div > button {
    background: none;
    border: 1px solid black;
    outline: none;
    border-radius: 3px;
    font-size: 1rem;
    padding-bottom: 2px;
    padding-top: 2px;
  }
  .sortPanel > div > button:hover,
  .sortPanel > div > button:focus,
  .sortPanel > div > button:active {
    border: 1px solid black;
  }
/***************/

/* Table css*/
  .table {
    display: grid;
    width: 95%;
    margin: 50px auto;
    grid-template-columns: 1fr;
  }
  .row {
    display: grid;
    grid-template-columns: repeat(2, 1fr 1fr 2fr) repeat(4, 1fr) 1.2fr;
    grid-template-rows: 35px;
    justify-items:center;
    align-items: center;
  }
  .head {
    font-size: 1rem;
    background: #99FF66;
    grid-template-rows: 40px;
    font-weight: bold;
  }
  /*first col in table, in two modes*/
  .checkboxInput input[type=checkbox] {
    visibility: hidden;
  }
  .checkboxInput {
    width: 19px;
    height: 19px;
    background: #ddd;
    border-radius: 100%;
    position: relative;
    box-shadow: 0px 1px 3px rgba(0,0,0,0.5);
  }
  .checkboxInput label {
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    transition: all .2s ease;
    cursor: pointer;
    position: absolute;
    top: 2.5px;
    left: 2.5px;
    z-index: 1;
    background: grey;
    box-shadow:inset 0px 1px 3px rgba(0,0,0,0.5);
  }
  .checkboxInput input[type=checkbox]:checked + label {
    background: #26ca28;
  }
  .isActive {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .isActive:before {
    content: '✖';
    position: absolute;
    font-size: 30px;
    color: grey;
    right: 0;
    left: 0;
    margin-left: auto;
    margin-right: auto;
  }
  .isActive.isChecked:before {
    content: '✔';
    color: green;
  }
  /*~~~~~~~~*/
  .editing {
    display: none;
    width: 100%;
  }
  .rowtable:hover {
    background: gainsboro;
  }
  .rowtable {
    border-bottom: 1px solid gainsboro;
  }
  .row:hover > .editing {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .row > input {
    width: 90%;
  }
  .editingButtons {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 100%
  }
/***************/

/* Limit css*/
  .limit {
    display: flex;
    justify-content: center;
    align-items: center;
    justify-self: end;
  }
  .limitButtons {
    background: none;
    font-size: 1.1rem;
    outline: none;
    border: none;
    margin: 4px;
    color: grey;
  }
  .limitButtons:active,
  .limitButtons:hover,
  .limitButtons:focus,
  .limitButtonsActive {
    font-weight: bold;
    cursor: pointer;
    color: black;
  }
/****************/
</style>
