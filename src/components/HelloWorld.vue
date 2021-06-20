<template>
  <h-page-content>
    <section class="hello">
      <img class="logo-large" src="../assets/images/vessel.png">

      <h1>Hello，欢迎使用 Vessel</h1>

      <h2 class="theme-test">开发前请先阅读</h2>

      <p>
        <a href="http://emptycup.hikvision.com.cn/template/" target="blank">web前端开发指南</a>
      </p>
    </section>
  </h-page-content>
</template>

<script>
export default {
  name: 'HelloWorld'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
    margin: 10px 0;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }

  .hello{
    text-align: center;
    padding-top: 100px;
  }

  .logo-large{
    width: 200px
  }
</style>
