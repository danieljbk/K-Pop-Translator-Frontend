'use strict'

// automatically set current backend url
const backendUrl = window.location.href

let inko = new Inko() // korean -> english characters and vice versa

// const websiteNameSubtext = document.getElementById('website-name-subtext');
const magnifyingGlass = document.getElementById('magnifying-glass')
const searchDiv = document.getElementById('search')
const searchbar = document.getElementById('searchbar')
const loadingText = document.getElementById('loading')
const songTitle = document.getElementById('display-song-title')
const artist = document.getElementById('display-artist-name')
const koreanTitleText = document.getElementById('korean-title')
const koreanLyricsText = document.getElementById('korean-lyrics')
const englishTitleText = document.getElementById('english-title')
const englishLyricsText = document.getElementById('english-lyrics')
const songImage = document.getElementById('display-song-image')
const errorMsg = document.getElementById('error-message')
const addTranslationButton = document.getElementById('add-translation')
const translationBody = document.getElementById('translated-lyrics')
const koreanVersion = document.getElementById('korean-version')
const englishVersion = document.getElementById('english-version')
const originalTitle = document.getElementById('original-title')
const originalLyrics = document.getElementById('original-lyrics')
const originalArtistName = document.getElementById('original-artist-name')
const originalSongInfo = document.getElementById('original-song-info')
const translatedSongInfo = document.getElementById('translated-song-info')
const topButtons = document.getElementById('top-buttons')
const topRightButton = document.getElementById('top-right-button')
const topLeftButton = document.getElementById('top-left-button')
const spotifyPlayer = document.getElementById('embedded-spotify-player')

const header = document.getElementById('header')
const logo = document.getElementById('logo')
const songContentDiv = document.getElementById('display-song-content')
const messageDiv = document.getElementById('display-message-text')
const translationAreaDiv = document.getElementById('display-translation-area')
const frontPageAreaDiv = document.getElementById('display-front-page')
messageDiv.style.display = 'none'
songContentDiv.style.display = 'none'
translationAreaDiv.style.display = 'none'
frontPageAreaDiv.style.display = 'none'
topButtons.style.display = 'none'

const resetElements = () => {
  loadingText.textContent = ''
  songTitle.textContent = ''
  artist.textContent = ''
  koreanTitleText.textContent = ''
  koreanLyricsText.textContent = ''
  englishTitleText.textContent = ''
  englishLyricsText.textContent = ''
  songImage.src = './public/images/transparent.png'
  errorMsg.textContent = ''
  addTranslationButton.src = ''
  translationBody.style.display = 'none'
  originalTitle.textContent = ''
  originalLyrics.textContent = ''
  originalArtistName.textContent = ''
  topRightButton.src = './public/images/transparent.png'
  topLeftButton.src = './public/images/transparent.png'
  spotifyPlayer.innerHTML = ''
}

const submitSearch = () => {
  const userInput = searchbar.value
  if (userInput) {
    resetElements()

    messageDiv.style.display = 'grid'
    songContentDiv.style.display = 'none'
    translationAreaDiv.style.display = 'none'
    frontPageAreaDiv.style.display = 'none'
    topButtons.style.display = 'none'

    const headerHeight = 12.5
    let root = document.documentElement
    root.style.setProperty('--header-height', headerHeight + 'vh') // collapse header
    root.style.setProperty('--header-flex-direction', 'row')
    header.style.borderBottomColor = '#ffffff'
    // document.body.style.background = '#1d1d1d';

    loadingText.textContent = 'Searching'

    // websiteNameSubtext.style.display = 'none';
    logo.style.height = 0.66 * headerHeight + 'vh'
    logo.style.display = 'block'
    logo.style.paddingLeft = '7.5vw'
    logo.src = './public/images/logo.png'

    const noKoreanLyrics = () => {
      console.log('missing korean lyrics...')

      messageDiv.style.display = 'grid'
      songContentDiv.style.display = 'none'
      translationAreaDiv.style.display = 'none'
      frontPageAreaDiv.style.display = 'none'

      const errorMsg = document.getElementById('error-message')
      errorMsg.setAttribute('style', 'white-space: pre;')
      errorMsg.textContent = 'No results for ' + '"' + userInput + '.' + '"'
    }

    console.log('retrieving search results...')

    axios
      .get(backendUrl + 'search' + '/' + 'multiple', {
        params: { searchTerm: userInput },
      })
      .then((res) => res.data)
      .then(async (songs) => {
        // render the home screen images
        fetch('./public/templates/front-page-song.mustache')
          .then((res) => res.text())
          .then((template) => {
            for (let i = 0; i <= 7; i++) {
              if (i >= songs.length) {
                // hide all unused song elements
                const rendered = Mustache.render(template, {
                  number: i.toString(),
                  songTitle: '',
                  songArtist: '',
                  imageUrl: '',
                  style: 'display: none;',
                })
                document.getElementById('front-page-song-' + i).innerHTML =
                  rendered
              } else {
                const song = songs[i]
                const rendered = Mustache.render(template, {
                  number: i.toString(),
                  songTitle:
                    song.title.length >= 25
                      ? song.title.substring(0, 22) + '...'
                      : song.title,
                  songArtist:
                    song.artist.length >= 29
                      ? song.artist.substring(0, 26) + '...'
                      : song.artist,
                  imageUrl: song.imageSrc,
                  style: '',
                })

                document.getElementById('front-page-song-' + i).innerHTML =
                  rendered
              }
              frontPageAreaDiv.style.display = 'block' // now show the results
              messageDiv.style.display = 'none'
            }
          })
          .then((res) => {
            const main = async (i) => {
              const selectedSongData = songs[i]

              const title = selectedSongData.title
              const artistName = selectedSongData.artist
              const koreanLyrics = selectedSongData.lyrics
              const imageSrc = selectedSongData.imageSrc

              /*
              // verify that there is a korean word in the lyrics
              let koreanLyricsContainKorean = false;

              // turn newlines into space and get rid of special characters (turns it into an array)
              for (let word of koreanLyrics
                .replaceAll('\n', ' ')
                .match(/[\p{L}-]+/gu)) {
                if (
                  word &&
                  word.toLowerCase() === inko.en2ko(word.toLowerCase())
                ) {
                  koreanLyricsContainKorean = true;
                  break;
                }
              }
              */

              // if (koreanLyricsContainKorean) {
              if (koreanLyrics) {
                console.log('collecting english lyrics...')

                messageDiv.style.display = 'grid'
                songContentDiv.style.display = 'none'
                translationAreaDiv.style.display = 'none'
                frontPageAreaDiv.style.display = 'none'
                searchDiv.style.display = 'none'
                topButtons.style.display = 'none'

                addTranslationButton.src = ''
                errorMsg.textContent = ''
                loadingText.textContent = 'Loading'

                let englishLyrics

                // check if user-generated song data is in database
                try {
                  await axios
                    .get(backendUrl + 'songs' + '/' + title)
                    .then((res) => res.data)
                    .then(async (existingSong) => {
                      englishLyrics = existingSong.englishLyrics
                    })
                } catch (err) {
                  console.log(title + ' is not in the database.')
                }

                // if not, search Genius with the title and artist
                if (!englishLyrics) {
                  try {
                    await axios
                      .get(backendUrl + 'search' + '/' + 'english', {
                        params: { searchTerm: title + ' ' + artist },
                      })
                      .then((res) => res.data)
                      .then(async (englishSongData) => {
                        englishLyrics = englishSongData.lyrics
                      })
                  } catch (err) {
                    console.log(
                      'No results found for "' + title + ' ' + artist + '".'
                    )
                  }
                }

                // if not, search Genius with just the title
                if (!englishLyrics) {
                  try {
                    await axios
                      .get(backendUrl + 'search' + '/' + 'english', {
                        params: { searchTerm: title },
                      })
                      .then((res) => res.data)
                      .then(async (englishSongData) => {
                        englishLyrics = englishSongData.lyrics
                      })
                  } catch (err) {
                    console.log('No results found for "' + title + '".')
                  }
                }

                /*
                // verify that there are no korean words in the lyrics
                let englishLyricsDoesNotContainKorean = true;
                if (englishLyrics) {
                  // englishLyrics.replaceAll('\n', ' ').match(/[\p{L}-]+/gu) // previously used RegExp
                  // turn newlines into space and get rid of special characters (turns it into an array)
                  for (let word of englishLyrics
                    .replaceAll('\n', ' ')
                    .replace(
                      /[`~!@#$%^&*()_|+0123456789\-–=?;:'",.<>{}\[\]\\\/]/gi,
                      ''
                    )
                    .split(' ')
                    .filter(Boolean)) {
                    if (
                      word &&
                      word.toLowerCase() === inko.en2ko(word.toLowerCase())
                    ) {
                      englishLyricsDoesNotContainKorean = false;
                      break;
                    }
                  }
                } 
                */

                // if (englishLyrics && englishLyricsDoesNotContainKorean) {
                if (englishLyrics) {
                  loadingText.textContent = ''

                  messageDiv.style.display = 'none'
                  songContentDiv.style.display = 'block'
                  translationAreaDiv.style.display = 'none'
                  frontPageAreaDiv.style.display = 'none'
                  searchDiv.style.display = 'flex'
                  topButtons.style.display = 'flex'

                  console.log('embedding Spotify player...')

                  // set up embedded Spotify player
                  spotifyPlayer.style.display = 'block'
                  songTitle.style.marginTop = '60px'
                  songImage.src = imageSrc
                  songImage.onload = () => {
                    spotifyPlayer.style.width = songImage.width * 0.8 + 'px'
                  }

                  await axios
                    .get(backendUrl + 'spotify' + '/' + 'html', {
                      params: {
                        koreanTitle: title,
                        artistName,
                      },
                    })
                    .then((res) => res.data)
                    .then((data) => {
                      spotifyPlayer.innerHTML = data.html
                    })
                    .catch((err) => {
                      // couldn't find the song on Spotify.
                      spotifyPlayer.style.display = 'none'
                      songTitle.style.marginTop = '0px'
                      console.log('failed to load music from Spotify.')
                    })

                  console.log('displaying song content...')

                  songTitle.textContent = title
                  artist.textContent = artistName
                  koreanTitleText.textContent = 'Original'
                  koreanLyricsText.setAttribute('style', 'white-space: pre;')
                  koreanLyricsText.textContent = koreanLyrics
                  englishTitleText.textContent = 'Translated'
                  englishLyricsText.setAttribute('style', 'white-space: pre;')
                  englishLyricsText.textContent = englishLyrics

                  if (koreanVersion.offsetWidth > englishVersion.offsetWidth) {
                    englishVersion.style.width =
                      koreanVersion.offsetWidth + 'px'
                  } else {
                    koreanVersion.style.width =
                      englishVersion.offsetWidth + 'px'
                  }

                  const editExistingTranslation = () => {
                    console.log('switching to edit translation mode...')

                    searchDiv.style.display = 'none'
                    messageDiv.style.display = 'none'
                    songContentDiv.style.display = 'none'
                    translationAreaDiv.style.display = 'grid'
                    frontPageAreaDiv.style.display = 'none'
                    topButtons.style.display = 'flex'

                    originalTitle.textContent = title
                    originalArtistName.textContent = artistName

                    translationBody.style.display = 'block'
                    translationBody.rows = koreanLyrics.split('\n').length - 1

                    translationBody.value = englishLyrics

                    originalLyrics.setAttribute('style', 'white-space: pre;')
                    originalLyrics.textContent = koreanLyrics

                    topLeftButton.src = './public/images/back.png'
                    topRightButton.src = './public/images/save-file.png'

                    topLeftButton.onclick = async () => {
                      messageDiv.style.display = 'none'
                      songContentDiv.style.display = 'block'
                      translationAreaDiv.style.display = 'none'
                      frontPageAreaDiv.style.display = 'none'
                      searchDiv.style.display = 'flex'
                      topButtons.style.display = 'flex'

                      topLeftButton.src = './public/images/back.png'
                      topRightButton.src = './public/images/pencil.png'

                      topLeftButton.onclick = async () => {
                        messageDiv.style.display = 'none'
                        songContentDiv.style.display = 'none'
                        translationAreaDiv.style.display = 'none'
                        frontPageAreaDiv.style.display = 'block'
                        searchDiv.style.display = 'flex'
                        topButtons.style.display = 'none'

                        topLeftButton.src = './public/images/transparent.png'
                        topRightButton.src = './public/images/transparent.png'
                      }
                      topRightButton.onclick = editExistingTranslation
                    }

                    topRightButton.onclick = async () => {
                      console.log('submitting translation...')

                      messageDiv.style.display = 'grid'
                      songContentDiv.style.display = 'none'
                      translationAreaDiv.style.display = 'none'
                      frontPageAreaDiv.style.display = 'none'
                      searchDiv.style.display = 'none'
                      topButtons.style.display = 'none'

                      addTranslationButton.src = ''
                      errorMsg.textContent = ''
                      loadingText.textContent = 'Saving'

                      try {
                        await axios.put(backendUrl + 'songs' + '/' + title, {
                          englishLyrics: translationBody.value,
                        })

                        resetElements()

                        searchbar.value = userInput
                        searchDiv.style.display = 'flex'

                        main(i)
                      } catch (err) {
                        console.log('Failed to save translation.')
                      }
                    }
                  }

                  // this code repeats down below. It is slightly different as it pulls existing text data.
                  topLeftButton.src = './public/images/back.png'
                  topRightButton.src = './public/images/pencil.png'

                  topLeftButton.onclick = async () => {
                    messageDiv.style.display = 'none'
                    songContentDiv.style.display = 'none'
                    translationAreaDiv.style.display = 'none'
                    frontPageAreaDiv.style.display = 'block'
                    searchDiv.style.display = 'flex'
                    topButtons.style.display = 'none'

                    topLeftButton.src = './public/images/transparent.png'
                    topRightButton.src = './public/images/transparent.png'
                  }

                  topRightButton.onclick = editExistingTranslation
                } else {
                  console.log('missing english translation...')

                  messageDiv.style.display = 'grid'
                  songContentDiv.style.display = 'none'
                  translationAreaDiv.style.display = 'none'
                  frontPageAreaDiv.style.display = 'none'
                  searchDiv.style.display = 'flex'
                  topButtons.style.display = 'flex'

                  loadingText.textContent = ''
                  errorMsg.setAttribute('style', 'white-space: pre;')
                  errorMsg.textContent =
                    'Nobody has translated' +
                    '\r\n' +
                    '"' +
                    title +
                    '"' +
                    '\r\n' +
                    'by' +
                    ' ' +
                    artistName +
                    '.' +
                    '\r\n\r\n' +
                    'Translate it yourself?'

                  // this code repeats down below. It is slightly different as it pulls existing text data.
                  topLeftButton.src = './public/images/back.png'
                  topRightButton.src = './public/images/transparent.png'

                  topLeftButton.onclick = async () => {
                    messageDiv.style.display = 'none'
                    songContentDiv.style.display = 'none'
                    translationAreaDiv.style.display = 'none'
                    frontPageAreaDiv.style.display = 'block'
                    searchDiv.style.display = 'flex'
                    topButtons.style.display = 'flex'

                    topLeftButton.src = './public/images/transparent.png'
                    topRightButton.src = './public/images/transparent.png'
                  }

                  topRightButton.onclick = () => {}

                  addTranslationButton.src = './public/images/feather-pen.png'
                  addTranslationButton.onclick = () => {
                    console.log('switching to new translation mode...')

                    messageDiv.style.display = 'none'
                    songContentDiv.style.display = 'none'
                    translationAreaDiv.style.display = 'grid'
                    frontPageAreaDiv.style.display = 'none'
                    searchDiv.style.display = 'none'
                    topButtons.style.display = 'flex'

                    searchDiv.style.display = 'none'

                    originalTitle.textContent = title
                    originalArtistName.textContent = artistName

                    translationBody.style.display = 'block'
                    translationBody.rows = koreanLyrics.split('\n').length - 1
                    translationBody.value = ''

                    originalLyrics.setAttribute('style', 'white-space: pre;')
                    originalLyrics.textContent = koreanLyrics.replaceAll(
                      '\n',
                      '\r\n'
                    )

                    topLeftButton.src = './public/images/back.png'
                    topRightButton.src = './public/images/save-file.png'

                    topLeftButton.onclick = async () => {
                      messageDiv.style.display = 'grid'
                      songContentDiv.style.display = 'none'
                      translationAreaDiv.style.display = 'none'
                      frontPageAreaDiv.style.display = 'none'
                      searchDiv.style.display = 'flex'
                      topButtons.style.display = 'flex'

                      topLeftButton.src = './public/images/back.png'
                      topRightButton.src = './public/images/transparent.png'

                      topLeftButton.onclick = async () => {
                        messageDiv.style.display = 'none'
                        songContentDiv.style.display = 'none'
                        translationAreaDiv.style.display = 'none'
                        frontPageAreaDiv.style.display = 'block'
                        searchDiv.style.display = 'flex'
                        topButtons.style.display = 'none'

                        topLeftButton.src = './public/images/transparent.png'
                        topRightButton.src = './public/images/transparent.png'
                      }
                    }

                    topRightButton.onclick = async () => {
                      console.log('submitting translation...')

                      messageDiv.style.display = 'grid'
                      songContentDiv.style.display = 'none'
                      translationAreaDiv.style.display = 'none'
                      frontPageAreaDiv.style.display = 'none'
                      searchDiv.style.display = 'none'
                      topButtons.style.display = 'none'

                      addTranslationButton.src = ''
                      errorMsg.textContent = ''
                      loadingText.textContent = 'Saving'

                      try {
                        await axios.put(backendUrl + 'songs' + '/' + title, {
                          englishLyrics: translationBody.value,
                        })

                        resetElements()

                        searchDiv.style.display = 'flex'
                        searchbar.value = userInput

                        main(i)
                      } catch (err) {
                        console.log('Failed to save translation.')
                      }
                    }
                  }
                }
              } else {
                noKoreanLyrics()
              }
            }

            for (let i = 0; i <= 7; i++) {
              const result = document.getElementById('result-' + i.toString())
              result.onclick = () => {
                console.log('collecting korean lyrics...')

                messageDiv.style.display = 'grid'
                songContentDiv.style.display = 'none'
                translationAreaDiv.style.display = 'none'
                frontPageAreaDiv.style.display = 'none'
                searchDiv.style.display = 'none'
                topButtons.style.display = 'none'

                addTranslationButton.src = ''
                errorMsg.textContent = ''
                loadingText.textContent = 'Loading'

                main(i)
              }
            }
          })
          .catch((err) => {
            console.log(err)
          })
      })
      .catch((err) => {
        noKoreanLyrics()
      })
      .then((res) => {
        loadingText.textContent = ''
      })
  }
}

// also submit when enter is pressed
searchbar.onkeydown = (event) => {
  const keyCode = event
    ? event.which
      ? event.which
      : event.keyCode
    : event.keyCode
  if (keyCode == 13) {
    event.preventDefault()
    submitSearch()
  }
}

// make the text for loading dynamic
setInterval(() => {
  const currentLoadingText = loadingText.textContent

  if (currentLoadingText) {
    if (currentLoadingText.split('.').length - 1 < 3) {
      loadingText.textContent += '.'
    } else {
      loadingText.textContent = currentLoadingText.replace('...', '')
    }
  }
}, 350)
