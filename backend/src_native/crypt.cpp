#include <node_api.h>
#include <unistd.h>

namespace NodeCrypt
{
  napi_value NodeCryptCallback(napi_env env, napi_callback_info info)
  {
    size_t argc = 2;
    napi_value argv[2];
    napi_status status = napi_get_cb_info(env, info, &argc, argv, nullptr, nullptr);
    if (status != napi_ok)
      return nullptr;
    if(argc != 2)
      return nullptr;

    char pw[4096];
    status = napi_get_value_string_utf8(env, argv[0], pw, sizeof(pw), nullptr);
    if (status != napi_ok)
      return nullptr;

    char oldCrypt[4096];
    status = napi_get_value_string_utf8(env, argv[1], oldCrypt, sizeof(oldCrypt), nullptr);
    if (status != napi_ok)
      return nullptr;

    char* result = crypt(pw, oldCrypt);

    napi_value resultValue;
    status = napi_create_string_utf8(env, result, NAPI_AUTO_LENGTH, &resultValue);

    return resultValue;
  }
  
  napi_value init(napi_env env, napi_value exports)
  {
    napi_value fn;
    napi_status status = napi_create_function(env, nullptr, 0, NodeCryptCallback, nullptr, &fn);
    if (status != napi_ok)
      return nullptr;
      
    status = napi_set_named_property(env, exports, u8"crypt", fn);
    if (status != napi_ok)
      return nullptr;
    return exports;
  }
  
  NAPI_MODULE(NODE_GYP_MODULE_NAME, init)

}