export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const appConfig = useAppConfig()

    if (import.meta.client) {
      function updateColor(type: 'primary' | 'neutral') {
        const color = localStorage.getItem(`nuxt-ui-${type}`)
        if (color) {
          appConfig.ui.colors[type] = color
        }
      }

      function updateRadius() {
        const radius = localStorage.getItem('nuxt-ui-radius')
        if (radius) {
          appConfig.theme.radius = Number.parseFloat(radius)
        }
      }

      function updateBlackAsPrimary() {
        const blackAsPrimary = localStorage.getItem('nuxt-ui-black-as-primary')
        if (blackAsPrimary) {
          appConfig.theme.blackAsPrimary = blackAsPrimary === 'true'
        }
      }

      updateColor('primary')
      updateColor('neutral')
      updateRadius()
      updateBlackAsPrimary()
    }

    if (import.meta.server) {
      useHead({
        script: [{
          innerHTML: `
            (function(){
              var ls=localStorage,s=document.querySelector.bind(document);
              var pc=ls.getItem('nuxt-ui-primary'),nc=ls.getItem('nuxt-ui-neutral');
              if(pc||nc){
                var el=s('style#nuxt-ui-colors'),h=el.innerHTML;
                if(pc&&pc!=='black')h=h.replace(/(--ui-color-primary-\\d{2,3}:\\s*var\\(--color-)${appConfig.ui.colors.primary}(-\\d{2,3}.*?\\))/g,'$1'+pc+'$2');
                if(nc)h=h.replace(/(--ui-color-neutral-\\d{2,3}:\\s*var\\(--color-)${appConfig.ui.colors.neutral}(-\\d{2,3}.*?\\))/g,'$1'+(nc==='neutral'?'old-neutral':nc)+'$2');
                el.innerHTML=h;
              }
              var r=ls.getItem('nuxt-ui-radius');
              if(r)s('style#nuxt-ui-radius').innerHTML=':root{--ui-radius:'+r+'rem}';
              var b=ls.getItem('nuxt-ui-black-as-primary');
              s('style#nuxt-ui-black-as-primary').innerHTML=b==='true'?':root{--ui-primary:black}.dark{--ui-primary:white}':'';
            })()
          `.replace(/\s+/g, ' '),
          tagPriority: -1,
          type: 'text/javascript',
        }],
      })
    }
  },
})
