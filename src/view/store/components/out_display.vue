<template>
  <div>
    <!-- 查看某个订单的详情信息  -->
    <Modal v-model="desc.show" title="出库单详情" :loading="loading" :mask-closable="false" :width="600" :styles="{top: '10px'}" :closable="false">
<!--      {{this.desc}}-->
      <Form>
        <FormItem label="出库单编号:" style="display: inline-flex; margin-right: 5px">
          <Input v-model="desc.outNo" disabled type="text" style="width: 120px"/>
        </FormItem>
        <FormItem label="操作人:" style="display: inline-flex; margin-left: 10px">
          <Input v-model="desc.userName" disabled type="text" style="width: 150px"/>
        </FormItem>
<!--        <FormItem label="供货商:" style="display: inline-flex; margin-left: 10px">-->
<!--          <Select v-model="seleted_supplier" disabled style="width:250px" clearable filterable>-->
<!--            <Option v-for="item in suppliers" :value="item.code" :key="item.code">{{ item.name }}</Option>-->
<!--          </Select>-->
<!--        </FormItem>-->
        <FormItem v-for="(value, key) in desc.content" :key="key" style="height: 15px">
<!--          {{value}}-->
          <label style="margin-left: 10px">名称:</label>
          <Input v-model="value.cnName" disabled style="width: 100px"/>
          <label style="margin-left: 10px">拼音:</label>
          <Input v-model="value.enName" disabled style="width: 100px"/>
          <label style="margin-left: 10px">使用重量(市斤):</label>
          <InputNumber v-model="value.used" disabled type="text" style="width: 100px"/>

        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="info" @click="cancel(false)">确定</Button>
        <Button type="warning" @click="print"> 打印</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { post } from '@/libs/axios-cfg'
export default {
  name: "out_display",
  props:{
    desc:{
      type:Object
    }
  },
  data(){
    return {
      loading: false
    }
  },
  methods: {
    cancel(up=false){
      this.$emit('cancel', up);
      // this.desc.show = false;
    },
    print() {
      window.print();
    }
  }
}
</script>

<style scoped>

</style>
