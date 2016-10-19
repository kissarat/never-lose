const textarea = document.querySelector('textarea')
const successButton = document.querySelector('.btn-primary')
const resetButton = document.querySelector('.btn-danger')
const successAlert = document.querySelector('.alert-success')

chrome.storage.sync.get('rules', function ({rules}) {
  if (!rules) {
    // [].map.call(document.querySelectorAll('[target=_blank]'), s => /^https?:\/\/([^\/]+)\/$/.exec(s.href)).filter(s => s).map(s => s[1]).join(' ')
    const porn = '24hentai.com 69games.xxx 88fuck.com actual-porn.org adultvideofinder.com alotporn.com amazon.com anotherpornblog.tumblr.com apetube.com apina.biz avn.com awsum.me babe-lounge.com babepedia.com badjojo.com befuck.com best-paypornsites.com bestpornstardb.com bootytape.com bravotube.net celebuzz.com chan.sankakucomplex.com daftporn.com dailee.com dansmovies.com definebabe.com deviantclip.com dirtyrottenwhore.com drtuber.com efukt.com elephanttube.com entnt.com eporner.com erooups.com erotica7.com eroxia.com extremetube.com fakku.net fapdu.com femdom-tube.xxx findtubes.com forum.oneclickchicks.com forum.xnxx.com forumophilia.com freeones.com freudbox.com fuckuh.com fuskator.com fux.com gelbooru.com h2porn.com hclips.com hdhentaisex.com hdporn.net hentai-foundry.com hentai.tc hentai4manga.com hentairules.net hentaischool.com hide-porn.winsite.com hollywoodlife.com imagearn.com inxporn.com justjared.com justusboys.com keepersecurity.com keezmovies.com kindgirls.com laineygossip.com lolhentai.net lustpin.com madthumbs.com maxim.com mediadetective.com mofosex.com myhentai.tv mypornbible.com myporngay.com myxvids.com nakednews.com nudevista.com nurglesnymphs.com nuvid.com orgasm.com peachyforum.com perezhilton.com pervclips.com phapit.com phun.org planetsuzy.org playforceone.com playporngames.com porn-wanted.com pornative.com pornbb.org pornbits.net porncor.com pornerbros.com pornheed.com pornhost.com pornhub.com pornicom.com pornjog.com pornmaxim.com pornmd.com pornpin.com pornplanner.com pornrabbit.com porntitan.com proporn.com punchpin.com pussytorrents.org sexforums.com sexyfuckgames.com simply-hentai.com slutload.com smutty.com spankbang.com sunporno.com the-pork.com thehollywoodgossip.com thenewporn.com thongsaroundtheworld.com tjoob.com tnaflix.com topfreepornvideos.com totallynsfw.com tube8.com tubegalore.com tubehentai.com updatetube.com uselessjunk.com userporn.com vintagepinupgirls.net vpornvideos.com wankoz.com wetplace.com wtfpeople.com xbabe.com xhamster.com xnxx.com xvideos.com xxxbunker.com xxxymovies.com youjizz.com youporn.com youramateurporn.com yourlustmovies.com'
      .replace(/\./g, '\\.')
      .split(' ')
      .map(s => `^https?:\\/\\/[\\w\\-\\.]+${s}\\/`)
    rules = [
      '# Special URLs',
      /^chrome:/,
      /^https?:..\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/,
      /^https?:..[^\/]*localhost/,
      /^https?:..[^\/]*.local/,

      '\n# Well known sites',
      /^https?:..[^\/]*apple.com/,
      /^https?:..[^\/]*aws.amazon.com/,
      /^https?:..[^\/]*bing.com/,
      /^https?:..[^\/]*facebook.com\/(messages|games|livemap|onthisday|translations|editor|saved)\//,
      /^https?:..[^\/]*gmail.com/,
      /^https?:..[^\/]*google.([a-z]+)/,
      /^https?:..[^\/]*api.telegram.org/,
      /^https?:..[^\/]*vk.com\/(im|video|friends|feed|groups|edit|apps)(\?act=\w+)$/,
      /^https?:..[^\/]*wikipedia.org/,
      /^https?:..[^\/]*yahoo.com/,
      /^https?:..[^\/]*yandex.([a-z]+)/,
      '\n# Porn sites'
    ]
      .map(s => 'string' == typeof s ? s : s.toString().slice(1, -1))
      .concat(porn)
      .join('\n')
  }

  textarea.value = rules

  successButton.addEventListener('click', function () {
    chrome.storage.sync.set({rules: textarea.value}, function () {
      successAlert.style.display = 'block'
      setTimeout(function () {
        successAlert.style.display = 'none'
      }, 3000)
    })
  })
})

resetButton.addEventListener('click', function () {
  chrome.storage.sync.clear(function () {
    location.reload()
  })
})
