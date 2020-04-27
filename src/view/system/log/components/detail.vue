<template>
<Modal v-model="base.seen" :styles="{top: '10px'}" :closable="false">
<!--  {{base}}-->
  <Tabs value="tab" @on-click="click_tab" v-model="actived">
    <TabPane label="内容详情" name="name1">
      <Form label-position="left">
        <FormItem label="姓名" style="display: inline-flex">
          <Input v-model="info.name" style="width:120px"></Input>
        </FormItem>
        <FormItem label="订单" style="display: inline-flex; margin-left: 10px">
          <Input v-model="info.orderNo" type="text" style="width:120px"></Input>
        </FormItem>
        <FormItem label="时间">
          <Input v-model="info.createDate" type="text" style="width: 200px"></Input>
        </FormItem>
        <FormItem v-for="(item,key) of info.content" :value=key :key=key>
          <div v-if="base.flag">
            <Label>{{item.sec_name}}(市斤):</Label>
            <Input v-model="item.weight" type="text" style="width: 100px"/>
          </div>
          <div v-else>
            <Label>{{item.cnName}}(市斤):</Label>
            <Input v-model="item.used" type="text" style="width: 100px"/>
          </div>
        </FormItem>
      </Form>
    </TabPane>
    <TabPane label="请求参数" name="name2">
      <vue-json-editor :value=content :showBtns="false"></vue-json-editor>
    </TabPane>
  </Tabs>
  <div slot="footer">
    <Button type="info" @click="cancel">确定</Button>
  </div>
</Modal>
</template>

<script>
  import vueJsonEditor from 'vue-json-editor';
  export default {
    name: "detail",
    components: {
      vueJsonEditor
    },
    props:{
      info:{
        type:Object
      },
      base:{
        type: Object
      }
    },
    data() {
      return{
        content: '',
        actived: 'name1',
      }
    },
    methods: {
      click_tab(){
        this.content = this.info;
      },
      cancel() {
        this.$emit('on-close', false);
      }
    },
    mounted() {
      console.info("detail created", this.info);
    }
  }
</script>

<style scoped>

</style>
